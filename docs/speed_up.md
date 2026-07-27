Otimizações aplicadas (lazy loading de seções bíblicas):

    1. src/App.jsx — loadVerses reescrito:
       - Cache in-memory por reference key (dedupe cross-render dentro da sessão)
       - Inflight dedupe (mesma referência = mesma Promise)
       - Cap de 4 fetches paralelos (um por evangelho)
       - AbortController cancela seção anterior quando usuário navega
       - Persiste resultados no Redux cachedVerses para reuso

    2. src/hooks/useBackgroundImporter.js — refatorado:
       - Antes: loop serial while(nextIndex !== -1) carregava TODAS as seções antes de completeImport()
       - Agora: ordem currentIndex → next → resto (prioridade visual)
       - Mesma dedupe + cap de 4 paralelos
       - Reage a currentSectionIndex — usuário pulou seção? Cancela e recarrega nova
       - Cada seção completa = dispatch individual via updateImportProgress (já existia)

    Ganhos esperados:
    - Importação grande (ex: 20 seções): usuário vê primeira em ~1 round-trip, não em N round-trips
    - Trocar de seção antes de concluir import = requests anteriores cancelados
    - Mesmo verse referenciado 2x = 1 fetch
    - Sort estável por número de versículo dentro de cada evangelho

    Arquivos: src/App.jsx:64-102 (helpers), src/App.jsx:147-256 (loadVerses), src/hooks/useBackgroundImporter.js:1-153 (todo o hook).
