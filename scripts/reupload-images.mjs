/**
 * Cloudinary Image Re-upload Script
 * 
 * WHAT IT DOES:
 * - Reads all product images from database
 * - Re-uploads each to Cloudinary with a NEW public ID (new URL)
 * - Updates database with new URLs
 * - Does NOT delete old images (safe rollback possible)
 * 
 * HOW TO RUN:
 * 
 * Step 1 - DRY RUN (preview only, nothing changes):
 *   node scripts/reupload-images.mjs --dry-run
 * 
 * Step 2 - ACTUAL RUN (uploads + updates DB):
 *   node scripts/reupload-images.mjs
 * 
 * Step 3 - After verifying locally, delete old images:
 *   node scripts/reupload-images.mjs --cleanup
 */

import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import https from 'https'
import http from 'http'

// ─── Check env variables ──────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))

const required = ['DATABASE_URL', 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
const missing = required.filter(k => !process.env[k])
if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '))
  console.error('   Run with: node --env-file=.env.local scripts/reupload-images.mjs --dry-run')
  process.exit(1)
}
console.log('✅ Environment variables loaded\n')

// ─── Config ──────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes('--dry-run')
const CLEANUP = process.argv.includes('--cleanup')
const DELAY_MS = 500 // delay between uploads to avoid rate limiting

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractPublicId(url) {
  try {
    // Extract public_id from Cloudinary URL
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

function isCloudinaryUrl(url) {
  return url && url.includes('res.cloudinary.com')
}

// ─── CLEANUP MODE ─────────────────────────────────────────────────────────────
async function cleanupOldImages() {
  console.log('🗑️  CLEANUP MODE — Deleting old Cloudinary images\n')
  console.log('⚠️  Make sure you have verified the website looks correct first!\n')

  // Read the migration log
  try {
    const logPath = join(__dirname, 'reupload-log.json')
    const log = JSON.parse(readFileSync(logPath, 'utf-8'))
    
    console.log(`Found ${log.length} old images to delete\n`)
    
    let deleted = 0
    let failed = 0

    for (const entry of log) {
      try {
        const oldPublicId = extractPublicId(entry.oldUrl)
        if (oldPublicId) {
          await cloudinary.uploader.destroy(oldPublicId)
          console.log(`✅ Deleted: ${oldPublicId}`)
          deleted++
        }
      } catch (err) {
        console.log(`❌ Failed to delete: ${entry.oldUrl} — ${err.message}`)
        failed++
      }
      await sleep(200)
    }

    console.log(`\n📊 Cleanup: ${deleted} deleted, ${failed} failed`)
  } catch (e) {
    console.error('❌ Could not read reupload-log.json. Run the main script first.')
    process.exit(1)
  }
}

// ─── MAIN UPLOAD FUNCTION ────────────────────────────────────────────────────
async function reuploadImages() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Cloudinary Image Re-upload Script')
  console.log('═══════════════════════════════════════════════════')
  console.log(DRY_RUN ? '🔍 MODE: DRY RUN (no changes will be made)\n' : '🚀 MODE: ACTUAL RUN (images will be re-uploaded)\n')

  // ── Fetch all product images from DB ────────────────────────────────────────
  console.log('📦 Fetching all products from database...')
  
  const products = await prisma.product.findMany({
    include: {
      images: {
        orderBy: { order: 'asc' }
      },
      variants: true,
    },
    where: { isArchived: false }
  })

  console.log(`✅ Found ${products.length} products\n`)

  // ── Summary before starting ──────────────────────────────────────────────────
  let totalImages = 0
  let cloudinaryImages = 0

  for (const product of products) {
    totalImages += product.images.length
    cloudinaryImages += product.images.filter(img => isCloudinaryUrl(img.url)).length
  }

  console.log('📊 Summary:')
  console.log(`   Products: ${products.length}`)
  console.log(`   Total Images: ${totalImages}`)
  console.log(`   Cloudinary Images to Re-upload: ${cloudinaryImages}`)
  console.log('')

  if (DRY_RUN) {
    console.log('─── DRY RUN — Products & Images List ──────────────\n')
    for (const product of products) {
      console.log(`📦 ${product.name}`)
      console.log(`   Price: ₹${product.price}${product.originalPrice ? ` (was ₹${product.originalPrice})` : ''}`)
      console.log(`   Stock: ${product.stock} | Variants: ${product.variants.length}`)
      console.log(`   Images: ${product.images.length}`)
      for (const img of product.images) {
        const isCloudinary = isCloudinaryUrl(img.url)
        console.log(`     ${isCloudinary ? '☁️ ' : '🔗'} ${img.url.substring(0, 80)}...`)
      }
      console.log('')
    }
    console.log('─────────────────────────────────────────────────')
    console.log(`\n✅ DRY RUN complete! ${cloudinaryImages} images would be re-uploaded.`)
    console.log('\nTo actually run: node scripts/reupload-images.mjs\n')
    return
  }

  // ── Actual Upload ────────────────────────────────────────────────────────────
  const log = []
  let success = 0
  let failed = 0
  let skipped = 0

  console.log('─── Starting Re-upload ─────────────────────────────\n')

  for (const product of products) {
    console.log(`\n📦 Processing: ${product.name}`)
    
    for (const image of product.images) {
      if (!isCloudinaryUrl(image.url)) {
        console.log(`   ⏭️  Skipped (not Cloudinary): ${image.url.substring(0, 60)}`)
        skipped++
        continue
      }

      try {
        console.log(`   ⬆️  Re-uploading image...`)
        
        // Clean URL — remove any transformation params for re-upload
        let sourceUrl = image.url
        if (sourceUrl.includes('/upload/w_') || sourceUrl.includes('/upload/q_')) {
          // Get the original URL without transformations
          sourceUrl = sourceUrl.replace(/\/upload\/[^/]+\//, '/upload/')
        }
        // Convert to /images-cdn/ proxy URL won't work for download, use direct URL
        if (sourceUrl.includes('/images-cdn/')) {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfka0sdnl'
          sourceUrl = sourceUrl.replace('/images-cdn/', `https://res.cloudinary.com/${cloudName}/`)
        }

        // Re-upload to Cloudinary with new public_id in new folder
        const uploadResult = await cloudinary.uploader.upload(sourceUrl, {
          folder: 'minimalist-beads-v2',
          quality: 'auto',
          fetch_format: 'auto',
        })

        const newUrl = uploadResult.secure_url
        
        // Update database
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: newUrl }
        })

        log.push({
          productName: product.name,
          imageId: image.id,
          oldUrl: image.url,
          newUrl: newUrl,
          oldPublicId: extractPublicId(image.url),
          newPublicId: uploadResult.public_id,
        })

        console.log(`   ✅ Done! New URL: ${newUrl.substring(0, 70)}...`)
        success++

        await sleep(DELAY_MS)

      } catch (err) {
        console.log(`   ❌ Failed: ${err.message}`)
        log.push({
          productName: product.name,
          imageId: image.id,
          oldUrl: image.url,
          error: err.message,
        })
        failed++
      }
    }
  }

  // ── Save log ─────────────────────────────────────────────────────────────────
  const { writeFileSync } = await import('fs')
  const logPath = join(__dirname, 'reupload-log.json')
  writeFileSync(logPath, JSON.stringify(log, null, 2))

  // ── Final Report ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════')
  console.log('  COMPLETE! Final Report')
  console.log('═══════════════════════════════════════════════════')
  console.log(`✅ Successfully re-uploaded: ${success}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⏭️  Skipped (non-Cloudinary): ${skipped}`)
  console.log(`📝 Log saved to: scripts/reupload-log.json`)
  console.log('')
  console.log('🔍 NEXT STEPS:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Check every product — images should look same')
  console.log('   3. If all good, delete old images:')
  console.log('      node scripts/reupload-images.mjs --cleanup')
  console.log('═══════════════════════════════════════════════════\n')
}

// ─── Entry Point ──────────────────────────────────────────────────────────────
async function main() {
  try {
    if (CLEANUP) {
      await cleanupOldImages()
    } else {
      await reuploadImages()
    }
  } catch (err) {
    console.error('\n❌ Fatal error:', err.message)
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
