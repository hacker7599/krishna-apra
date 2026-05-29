/** Page toolbar — title lives in the top bar; this row is for description + actions. */
export function AdminPageHeader({
  title: _title,
  description,
  actions,
}: {
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  if (!description && !actions) return null;

  return (
    <div className="admin-toolbar">
      {description ? <p className="admin-toolbar__desc">{description}</p> : <div />}
      {actions ? <div className="admin-toolbar__actions">{actions}</div> : null}
    </div>
  );
}
