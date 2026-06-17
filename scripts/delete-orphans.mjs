/**
 * Cloudinary Orphaned Images Cleanup Script
 * 
 * WHAT IT DOES:
 * - Fetches all image URLs referenced in the database (active and archived)
 * - Lists all actual files inside the 'minimalist_beads_products/' folder on Cloudinary
 * - Identifies "orphaned" files (files that exist on Cloudinary but are NOT in the database)
 * - Deletes these orphaned files in batches of 100 to free up storage space.
 * 
 * RUN COMMAND:
 *   node --env-file=.env.local scripts/delete-orphans.mjs
 */

import { v2 as cloudinary } from 'cloudinary'
import { PrismaClient } from '@prisma/client'

const DRY_RUN = process.argv.includes('--dry-run')

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

function extractPublicId(url) {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  Cloudinary Orphaned Images Cleanup')
  console.log('═══════════════════════════════════════════════════')
  console.log(DRY_RUN ? '🔍 MODE: DRY RUN (no deletion)\n' : '🚀 MODE: ACTUAL CLEANUP\n')

  // Step 1: Fetch all image URLs from database
  console.log('📦 Fetching all image URLs from database...')
  const dbImages = await prisma.productImage.findMany({
    select: { url: true }
  })
  
  const dbPublicIds = new Set()
  dbImages.forEach(img => {
    const publicId = extractPublicId(img.url)
    if (publicId) dbPublicIds.add(publicId)
  })

  console.log(`✅ Found ${dbPublicIds.size} unique image public IDs referenced in DB.\n`)

  // Step 2: List all resources under 'minimalist_beads_products/' on Cloudinary
  console.log('☁️  Listing assets in folder: minimalist_beads_products/ ...')
  let remainingAssets = []
  let nextCursor = null
  
  do {
    const options = {
      type: 'upload',
      prefix: 'minimalist_beads_products/',
      max_results: 500,
    }
    if (nextCursor) {
      options.next_cursor = nextCursor
    }
    const result = await cloudinary.api.resources(options)
    remainingAssets = remainingAssets.concat(result.resources)
    nextCursor = result.next_cursor
  } while (nextCursor)

  console.log(`✅ Found ${remainingAssets.length} total files in folder on Cloudinary.\n`)

  // Step 3: Filter orphaned files
  const orphans = []
  for (const asset of remainingAssets) {
    if (!dbPublicIds.has(asset.public_id)) {
      orphans.push(asset.public_id)
    }
  }

  console.log(`📊 Analysis:`)
  console.log(`   - Total files: ${remainingAssets.length}`)
  console.log(`   - Referenced in DB (Safe): ${remainingAssets.length - orphans.length}`)
  console.log(`   - Orphaned (Safe to delete): ${orphans.length}`)
  console.log('')

  if (orphans.length === 0) {
    console.log('🎉 No orphaned assets found. Cloudinary is clean!')
    return
  }

  if (DRY_RUN) {
    console.log('🔍 DRY RUN: Sample of orphaned files that would be deleted:')
    orphans.slice(0, 10).forEach(id => console.log(`  - ${id}`))
    console.log(`\nTo execute cleanup, run without --dry-run`)
    return
  }

  // Step 4: Delete orphans in batches of 100
  console.log(`🗑️  Deleting ${orphans.length} orphaned files...`)
  const batchSize = 100
  let deletedCount = 0

  for (let i = 0; i < orphans.length; i += batchSize) {
    const batch = orphans.slice(i, i + batchSize)
    try {
      console.log(`   Deleting batch ${Math.floor(i / batchSize) + 1} (${batch.length} files)...`)
      const res = await cloudinary.api.delete_resources(batch)
      deletedCount += Object.keys(res.deleted || {}).length
    } catch (err) {
      console.error(`   ❌ Failed to delete batch starting at index ${i}:`, err.message)
    }
    // Small pause to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\n🎉 SUCCESS! Deleted ${deletedCount} orphaned files from Cloudinary.`)
}

main()
  .catch(err => console.error('Error:', err))
  .finally(() => prisma.$disconnect())
