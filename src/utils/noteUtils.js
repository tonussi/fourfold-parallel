export const buildNoteContextId = (context) =>
  [context.sectionTitle, context.gospel, context.reference, context.verse, context.word]
    .filter(Boolean)
    .join('::')
