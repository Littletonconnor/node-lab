import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

function logMemoryUsage() {
  const used = process.memoryUsage()
  for (const key in used) {
    console.log(`[MemoryUsage (${key})]: `, used[key] / 1024 / 1024 + 'MB')
  }
}

// Get the path to the current file (is cross platform capable)
const __filename = fileURLToPath(import.meta.url)

// Get the current working directory
const __dirname = dirname(__filename)

console.log('__filename', __filename)
console.log('__dirname', __dirname)

function main() {
  const flag = parseInt(process.argv[2])
  const filepath = join(__dirname, 'data', 'largeFile.txt')

  switch (flag) {
    case 1:
      // 1) We'll read a large file in a streaming manner so we don't load the entire 5MB in memory at once.
      const readStream = fs.createReadStream(filepath, { encoding: 'utf-8' })

      // 2) Stream the file line by line.
      // We're doing a brute force approach here by splitting on newlines but a more sophisticated approach
      // would use something like readline or csv-parser
      let buffer = ''
      readStream.on('data', (chunk) => {
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          console.log('[ReadStream (PROCESSING)]: ', line)
        }
      })

      readStream.on('end', () => {
        console.log('[ReadStream (FINISHED)]')
        logMemoryUsage()
      })

      break
    case 2:
      // 1) We'll read a large file in a non-streaming manner instead of a stream
      // The difference between this and the previous version is instead of chunks we're dealing with the entire
      // We should see way more HEAP used since we're dumping the entire 5MB file in memory
      fs.readFile(filepath, { encoding: 'utf-8' }, (error, data) => {
        if (error) {
          console.error(`Error processing entire file: `, error)
          process.exit(1)
        }

        const lines = data.split('\n')

        for (const line of lines) {
          console.log('[ReadFile (PROCESSING)]: ', line)
        }
        logMemoryUsage()
      })
      break

    default:
      console.error(`Invalid argument passed: `, flag)
      process.exit(1)
  }
}

try {
  main()
} catch (error) {
  console.error('ERROR WHILE RUNNING MAIN', error)
  process.exit(1)
}
