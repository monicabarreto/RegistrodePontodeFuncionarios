import { Link } from "react-router-dom";


export const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 fixed top-0 w-full z-50 shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Sistema de Pontos</h1>
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Início</Link>
          <Link to="/login" className="hover:underline">Login Funcionário</Link>
          <Link to="/admin/login" className="hover:underline">Login Admin</Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
