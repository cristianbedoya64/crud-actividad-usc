import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

const initialForm = { nombre: "", correo: "", telefono: "" };

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ type: "", msg: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  // Leer usuarios de Firestore
  const fetchUsuarios = async () => {
    try {
      const q = query(collection(db, "usuarios"), orderBy("nombre"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(data);
    } catch {
      setAlert({ type: "danger", msg: "Error al cargar usuarios" });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!form.correo.trim()) newErrors.correo = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) newErrors.correo = "Correo inválido.";
    else if (usuarios.some(u => u.correo === form.correo && u.id !== editId)) newErrors.correo = "Este correo ya está registrado.";
    if (!form.telefono.trim()) newErrors.telefono = "El teléfono es obligatorio.";
    else if (!/^[0-9\s\-\+]{7,15}$/.test(form.telefono)) newErrors.telefono = "Teléfono inválido (7-15 dígitos).";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setAlert({ type: "danger", msg: "Corrige los errores del formulario." });
      return;
    }
    try {
      if (editId) {
        const usuarioRef = doc(db, "usuarios", editId);
        await updateDoc(usuarioRef, {
          nombre: form.nombre,
          correo: form.correo,
          telefono: form.telefono
        });
        setAlert({ type: "success", msg: "Usuario actualizado" });
      } else {
        await addDoc(collection(db, "usuarios"), {
          nombre: form.nombre,
          correo: form.correo,
          telefono: form.telefono
        });
        setAlert({ type: "success", msg: "Usuario agregado" });
      }
      setForm(initialForm);
      setEditId(null);
      setErrors({});
      fetchUsuarios();
    } catch {
      setAlert({ type: "danger", msg: "Error al guardar" });
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
      await deleteDoc(doc(db, "usuarios", id));
      setAlert({ type: "success", msg: "Usuario eliminado" });
      fetchUsuarios();
    } catch {
      setAlert({ type: "danger", msg: "Error al eliminar" });
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
              <form className="row g-3 align-items-end" onSubmit={handleSubmit} autoComplete="off" role="form" aria-label="Formulario de usuario">
                <div className="col-md-4">
                  <label className="form-label" htmlFor="nombre">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className={`form-control${errors.nombre ? " is-invalid" : ""}`}
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    maxLength={50}
                    required
                    aria-label="Nombre"
                    aria-invalid={!!errors.nombre}
                    tabIndex={0}
                  />
                  {errors.nombre && <div className="invalid-feedback" role="alert">{errors.nombre}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label" htmlFor="correo">Correo</label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    className={`form-control${errors.correo ? " is-invalid" : ""}`}
                    placeholder="Correo"
                    value={form.correo}
                    onChange={handleChange}
                    maxLength={60}
                    required
                    aria-label="Correo"
                    aria-invalid={!!errors.correo}
                    tabIndex={0}
                  />
                  {errors.correo && <div className="invalid-feedback" role="alert">{errors.correo}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label" htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    className={`form-control${errors.telefono ? " is-invalid" : ""}`}
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                    maxLength={15}
                    required
                    aria-label="Teléfono"
                    aria-invalid={!!errors.telefono}
                    tabIndex={0}
                  />
                  {errors.telefono && <div className="invalid-feedback" role="alert">{errors.telefono}</div>}
                </div>
                <div className="col-md-1 d-grid">
                  <button
                    type="submit"
                    className={`btn ${editId ? "btn-warning" : "btn-success"}`}
                    aria-label={editId ? "Actualizar usuario" : "Agregar usuario"}
                    tabIndex={0}
                  >
                    <i className={`bi ${editId ? "bi-pencil-square" : "bi-person-plus-fill"} me-1`}></i>
                    {editId ? "Actualizar" : "Agregar"}
                  </button>
                </div>
                {editId && (
                  <div className="col-md-12 d-grid">
                    <button
                      type="button"
                      className="btn btn-secondary mt-2"
                      onClick={handleCancel}
                      aria-label="Cancelar edición"
                      tabIndex={0}
                    >
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
                              aria-label={`Editar usuario ${usuario.nombre}`}
                              onClick={() => handleEdit(usuario)}
                              tabIndex={0}
                              role="button"
                            >
                              <i className="bi bi-pencil-square"></i> Editar
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              title="Eliminar"
                              aria-label={`Eliminar usuario ${usuario.nombre}`}
                              onClick={() => handleDelete(usuario.id)}
                              tabIndex={0}
                              role="button"
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