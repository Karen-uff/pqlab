import { chromium } from 'playwright'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, 'screenshots')

async function shot(page, name) {
  await page.waitForTimeout(700)
  const buf = await page.screenshot({ type: 'png', fullPage: false })
  writeFileSync(join(OUT, name), buf)
  console.log(`✓ ${name}`)
}

async function nav(page, route) {
  await page.evaluate(() => localStorage.setItem('pqlab_demo_logged_in', 'true'))
  await page.goto(`http://localhost:5173/#${route}`)
  await page.waitForTimeout(1400)
}

async function clickNthButton(page, n) {
  await page.evaluate((idx) => {
    document.querySelectorAll('button')[idx].click()
  }, n)
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()

  // ── Login page ─────────────────────────────────────────────────────────
  await page.goto('http://localhost:5173/#/login')
  await page.waitForTimeout(800)
  await shot(page, '00-login.png')

  // Enter demo mode
  await page.evaluate(() => localStorage.setItem('pqlab_demo_logged_in', 'true'))
  await page.locator('button', { hasText: 'demonstração' }).click()
  await page.waitForURL('**/#/diario', { timeout: 6000 }).catch(() => {})
  await page.waitForTimeout(800)

  // ── 1. Diário de Campo ─────────────────────────────────────────────────
  // buttons: 0:Sair 1:icon(sidebar) 2:XLS 3:PDF 4:.md 5:Nova entrada
  //          6:Favoritas  [per entry:] 7:fav 8:md 9:pdf 10:Editar 11:Excluir 12:Expandir
  //                                   13:fav 14:md 15:pdf 16:Editar 17:Excluir 18:Expandir
  await nav(page, '/diario')
  await shot(page, '01-diario.png')
  await clickNthButton(page, 12)   // Expandir (first entry)
  await page.waitForTimeout(900)
  await shot(page, '01-diario-exp.png')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(400)

  // ── 2. Listas e Memorandos ─────────────────────────────────────────────
  // buttons: 0:Sair 1:icon 2:icon 3:Mostrar favoritas 4:Novo
  //          [card:] 5:Adicionar favoritos 6:icon(edit?) 7:icon(open?)
  await nav(page, '/listas')
  await shot(page, '02-listas.png')
  await clickNthButton(page, 7)    // open list editor
  await page.waitForTimeout(900)
  await shot(page, '02-listas-exp.png')
  await page.go_back?.().catch?.(() => {}) // no dialog to close — navigate back
  await nav(page, '/listas')
  await page.waitForTimeout(400)

  // ── 3. Tarefas ────────────────────────────────────────────────────────
  // buttons: 0:Sair 1:icon 2:icon 3:icon 4:Novo [card:] 5:icon(open) 6:icon(delete)
  await nav(page, '/tarefas')
  await shot(page, '03-tarefas.png')
  await clickNthButton(page, 5)    // open first task list editor
  await page.waitForTimeout(900)
  await shot(page, '03-tarefas-exp.png')
  // navigate back by going to tarefas again
  await nav(page, '/tarefas')
  await page.waitForTimeout(400)

  // ── 4. Favoritos ──────────────────────────────────────────────────────
  // buttons: 0:Sair 1:icon 2:RSS 3:Novo favorito 4:Fav(3) 5:RSS(1) 6:Todos os tipos
  //          7:icon 8:icon [tags:] 9:ciência 10:metodologia 11:periódicos 12:qualitativa
  //          [card1:] 13:icon(edit) 14:icon(delete)  [card2:] 15:icon(edit) 16:icon(delete)
  await nav(page, '/bookmarks')
  await shot(page, '04-bookmarks.png')
  await clickNthButton(page, 13)   // edit first bookmark
  await page.waitForTimeout(900)
  await shot(page, '04-bookmarks-exp.png')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(400)

  // ── 5. Fichamentos ────────────────────────────────────────────────────
  // buttons: 0:Sair 1:icon 2:XLS 3:CSV 4:Novo fichamento 5:ABNT
  //          [card:] 6:icon 7:icon 8:.md 9:PDF 10:icon(edit) 11:icon(del) 12:icon(exp)
  await nav(page, '/fichamentos')
  await shot(page, '05-fichamentos.png')
  await clickNthButton(page, 10)   // open first fichamento editor
  await page.waitForTimeout(900)
  await shot(page, '05-fichamentos-exp.png')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(400)

  // ── 6. Planos ─────────────────────────────────────────────────────────
  // buttons: 0:Sair 1:icon 2:Novo plano
  //          [card:] 3:.md 4:XLS 5:PDF 6:Editar 7:Excluir 8:icon(chevron expand)
  await nav(page, '/planos')
  await shot(page, '06-planos.png')
  await clickNthButton(page, 8)    // expand plan chevron
  await page.waitForTimeout(1000)
  await shot(page, '06-planos-exp.png')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(400)

  // ── 7. Mapa ───────────────────────────────────────────────────────────
  await nav(page, '/mapa')
  await page.waitForTimeout(1800) // graph render
  await shot(page, '07-mapa.png')
  await page.mouse.move(640, 400)
  await page.waitForTimeout(900)
  await shot(page, '07-mapa-exp.png')

  // ── 9. Submissões ─────────────────────────────────────────────────────
  await nav(page, '/submissoes')
  await shot(page, '09-submissoes.png')

  // Show Purgatório and expand event timeline on the card with evento badge
  await page.getByRole('button', { name: /Mostrar Purgatório/ }).click()
  await page.waitForTimeout(600)
  // Find the card with "Chatbots" (has 1 evento), click its last (expand) button
  const chatbotsCard = page.locator('[class*="bg-white border"]', { hasText: 'Chatbots' }).first()
  await chatbotsCard.locator('button').last().click().catch(() => {})
  await page.waitForTimeout(900)
  await shot(page, '09-submissoes-exp.png')

  await browser.close()
  console.log('\nDone!')
})()
