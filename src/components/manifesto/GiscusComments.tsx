import Giscus from '@giscus/react'

// ─── FILL IN CATEGORY_ID ─────────────────────────────────────────────────────
// 1. Install the Giscus app on Omni-Ouro/EyroDiscusson:
//    https://github.com/apps/giscus
// 2. Visit https://giscus.app, enter "Omni-Ouro/EyroDiscusson", choose your
//    Discussion category (e.g. "General"), then copy the categoryId below.
const REPO        = 'Omni-Ouro/EyroDiscusson' as `${string}/${string}`
const REPO_ID     = 'R_kgDOS22BeA'
const CATEGORY    = 'General'
const CATEGORY_ID = 'DIC_kwDOS22BeM4C-6Q3'
// ─────────────────────────────────────────────────────────────────────────────

export function GiscusComments() {
  return (
    <div className="mf-giscus-wrap">
      <div className="mf-section-label" style={{ marginBottom: 24 }}>Discussion</div>
      <Giscus
        repo={REPO}
        repoId={REPO_ID}
        category={CATEGORY}
        categoryId={CATEGORY_ID}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark_tritanopia"
        lang="en"
        loading="lazy"
      />
    </div>
  )
}
