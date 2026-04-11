// ─────────────────────────────────────────────────────────────────────────────
// components/LoginBackground.jsx — Orbs decorativos de fundo da tela de login
// ─────────────────────────────────────────────────────────────────────────────

function LoginBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[120px]" />
    </div>
  );
}

export default LoginBackground;