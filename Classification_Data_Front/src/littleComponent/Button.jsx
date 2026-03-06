export function Button({ action, buttonhandle, classname }) {
  return (
    <button onClick={buttonhandle} className={classname}>
      {action}
    </button>
  );
}
