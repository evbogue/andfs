#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { parseArgs } from "jsr:@std/cli/parse-args"
import * as path from "jsr:@std/path"
import { ensureDir } from "jsr:@std/fs"
import { apds } from "https://esm.sh/gh/evbogue/apds/apds.js"
import { add, get } from "./andfs.js"

await apds.start("myAppName")

const parsed = parseArgs(Deno.args)         
const [command, target, dest] = parsed._    
const help = parsed.help || parsed.h        

if (help || !command) {
  console.log(`
usage: andfs <command> <target> [dest]

commands:
  add <path>     add a file or directory to andfs
  get <manifest> restore files from a saved manifest JSON
`)
  Deno.exit(0)
}

function showProgress(step, index, total) {
  Deno.stdout.write(new TextEncoder().encode(`\r${step}: ${index}/${total}`))
  if (index === total) Deno.stdout.write(new TextEncoder().encode("\n"))
}

async function addPath(p) {
  const stat = await Deno.stat(p)
  if (stat.isFile) {
    const file = await Deno.readFile(p)
    const manifest = await add(file, prog => showProgress("uploading chunk", prog.index, prog.total))
    return { name: path.basename(p), manifest }
  } else if (stat.isDirectory) {
    const entries = []
    for await (const entry of Deno.readDir(p)) {
      const child = await addPath(path.join(p, entry.name))
      entries.push(child)
    }
    const manifest = await add(new TextEncoder().encode(JSON.stringify(entries)))
    return { name: path.basename(p), manifest, children: entries }
  } else {
    throw new Error(`unsupported path: ${p}`)
  }
}

async function getManifest(node, outDir) {
  const outPath = path.join(outDir, node.name)
  if (node.children) {
    await ensureDir(outPath)
    for (const child of node.children) {
      await getManifest(child, outPath)
    }
  } else {
    const data = await get(node.manifest, prog => showProgress("recreating chunk", prog.index, prog.total))
    await ensureDir(path.dirname(outPath))
    await Deno.writeFile(outPath, data)
    console.log(`restored file: ${outPath}`)
  }
}

if (command === "add") {
  if (!target) {
    console.error("please specify a path to add")
    Deno.exit(1)
  }
  const tree = await addPath(target)
  console.log(JSON.stringify(tree, null, 2)) // output manifest to terminal
  Deno.exit(0)
} else if (command === "get") {
  if (!target) {
    console.error("please specify a manifest JSON file to get")
    Deno.exit(1)
  }
  const manifestText = await Deno.readTextFile(target)
  const rootNode = JSON.parse(manifestText)
  await getManifest(rootNode, dest || "./")
  Deno.exit(0)
} else {
  console.error(`unknown command: ${command}`)
  Deno.exit(1)
}

