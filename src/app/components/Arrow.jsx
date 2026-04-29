export default function Arrow({ direction = 'right', size }) {
  const isExternal = direction === 'external';
  const arrowSize = size || (isExternal ? 13 : 15);

  return (
    <svg
      aria-hidden="true"
      width={arrowSize}
      height={arrowSize}
      viewBox="0 0 16 16"
      style={{ flexShrink: 0 }}
    >
      {isExternal ? (
        <>
          <path d="M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          <path d="M7 4h5v5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
        </>
      ) : (
        <>
          <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          <path d="M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
        </>
      )}
    </svg>
  );
}
