function Campo({ label, error, children }) {
  return (
    <label className="Campo">
      <span>{label}</span>
      {children}
      {error && <small className="error">{error}</small>}
    </label>
  )
}

export default Campo