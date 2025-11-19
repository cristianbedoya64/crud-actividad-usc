import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:3001/usuarios";
const initialForm = { nombre: "", correo: "", telefono: "" };

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ type: "", msg: "" });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsuarios(data);
    } catch {
      setAlert({ type: "error", msg: "Error al cargar usuarios" });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValid = () =>
    form.nombre.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo) &&
    /^[0-9\s\-\+]{7,15}$/.test(form.telefono);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      setAlert({ type: "error", msg: "Datos inválidos" });
      return;
    }
    try {
      if (editId) {
        await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setAlert({ type: "success", msg: "Usuario actualizado" });
      } else {
        await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setAlert({ type: "success", msg: "Usuario agregado" });
      }
      setForm(initialForm);
      setEditId(null);
      fetchUsuarios();
    } catch {
      setAlert({ type: "error", msg: "Error al guardar" });
    }
  };

  const handleEdit = (usuario) => {
    setForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
    });
    setEditId(usuario.id);
    setAlert({ type: "", msg: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setAlert({ type: "success", msg: "Usuario eliminado" });
      fetchUsuarios();
    } catch {
      setAlert({ type: "error", msg: "Error al eliminar" });
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditId(null);
    setAlert({ type: "", msg: "" });
  };

  return (
    <div className="container fullscreen py-4" style={{maxWidth: '100vw'}}>
      <div className="row justify-content-center mb-4">
        <div className="col-lg-8">
          <div className="bg-primary text-white rounded shadow p-4 mb-4 text-center">
            <h1 className="mb-0 fw-bold">CRUD Usuarios</h1>
            <p className="mb-0">React + Bootstrap + json-server</p>
          </div>
        </div>
      </div>
      <div className="row justify-content-center mb-4">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-light fw-bold">
              {editId ? "Editar usuario" : "Agregar usuario"}
            </div>
            <div className="card-body">
              {alert.msg && (
                <div className={`alert alert-${alert.type === "success" ? "success" : "danger"} alert-dismissible fade show`} role="alert">
                  {alert.msg}
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setAlert({ type: "", msg: "" })}></button>
                </div>
              )}
              <form className="row g-3 align-items-end" onSubmit={handleSubmit} autoComplete="off">
                <div className="col-md-4">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    className="form-control"
                    placeholder="Correo"
                    value={form.correo}
                    onChange={handleChange}
                    maxLength={60}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    className="form-control"
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                    maxLength={15}
                    required
                  />
                </div>
                <div className="col-md-1 d-grid">
                  <button type="submit" className={`btn ${editId ? "btn-warning" : "btn-success"}`}>
                    <i className={`bi ${editId ? "bi-pencil-square" : "bi-person-plus-fill"} me-1`}></i>
                    {editId ? "Actualizar" : "Agregar"}
                  </button>
                </div>
                {editId && (
                  <div className="col-md-12 d-grid">
                    <button type="button" className="btn btn-secondary mt-2" onClick={handleCancel}>
                      Cancelar edición
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-light fw-bold">Listado de usuarios</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No hay usuarios registrados.
                        </td>
                      </tr>
                    ) : (
                      usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>{usuario.id}</td>
                          <td>{usuario.nombre}</td>
                          <td>{usuario.correo}</td>
                          <td>{usuario.telefono}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary me-2"
                              title="Editar"
                              onClick={() => handleEdit(usuario)}
                            >
                              <i className="bi bi-pencil-square"></i> Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Eliminar"
                              onClick={() => handleDelete(usuario.id)}
                            >
                              <i className="bi bi-trash"></i> Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}