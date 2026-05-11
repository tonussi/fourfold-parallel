function InfoBox({ message }) {
  return (
    <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
      <p className="text-sm text-violet-600 dark:text-violet-400 text-center">
        {message}
      </p>
    </div>
  )
}

export default InfoBox
