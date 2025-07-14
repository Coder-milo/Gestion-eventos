// Rutas y vistas asociadas
const routes = {
  "/": "/views/login.html",
  "/register": "/views/register.html",
  "/homeAdmin": "/views/homeAdmin.html",
  "/homeVisitante": "/views/homeVisitante.html",
  "/gestionarEventos": "/views/gestionarEventos.html",
  "/eventos": "/views/eventos.html",
  "/misEventos": "/views/misEventos.html",
  "/notfound": "/views/notfound.html"
};
// Reglas de acceso por rol
const accessRules = {
  "/homeAdmin": "admin",
  "/gestionarEventos": "admin",
  "/homeVisitante": "visitante",
  "/eventos": "visitante",
  "/misEventos": "visitante"
};
// Guardian de rutas y lagica de redireccion
export async function router() {
  let path= (window.location.hash || "#/").replace("#", "");
  const isLogged= localStorage.getItem("logueado");
  const rol= localStorage.getItem("rol");
  // Si no esta autenticado y quiere acceder a rutas protegidas redirige a notfound
  if (!isLogged && path !== "/" && path !== "/register") {
    return await loadView("/notfound", routes["/notfound"]);
  }
  // Si esta autenticado y quiere ir a login o register redirige al dashboard correspondiente
  if (isLogged && (path === "/" || path === "/register")) {
    if (rol === "admin") return await loadView("/homeAdmin", routes["/homeAdmin"]);
    if (rol === "visitante") return await loadView("/homeVisitante", routes["/homeVisitante"]);
  }
  // Si la ruta requiere rol y el usuario no tiene el rol redirige a notfound
  if (accessRules[path] && rol !== accessRules[path]) {
    return await loadView("/notfound", routes["/notfound"]);
  }
  // Si la ruta existe, carga la vista, si no, notfound
  const htmlPath = routes[path] || routes["/notfound"];
  await loadView(path, htmlPath);
}
// Carga la vista y asocia los eventos segun la ruta
async function loadView(path, viewPath) {
  const res = await fetch(viewPath);
  const html = await res.text();
  document.getElementById("app").innerHTML = html;
  // Login
  if (path === "/") {
    document.getElementById("loginForm")?.addEventListener("submit", login);
  }
  // Registro
  if (path === "/register") {
    document.getElementById("registerForm")?.addEventListener("submit", register);
  }
  // Dashboard admin
  if (path === "/homeAdmin") {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("btnGestionar")?.addEventListener("click", () => window.location.hash = "#/gestionarEventos");
  }
  // Dashboard visitante
  if (path === "/homeVisitante") {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("btnEventos")?.addEventListener("click", () => window.location.hash = "#/eventos");
    document.getElementById("btnMisEventos")?.addEventListener("click", () => window.location.hash = "#/misEventos");
  }
  // CRUD de eventos para admin
  if (path === "/gestionarEventos") {
    document.getElementById("formEventos")?.addEventListener("submit", crearEvento);
    mostrarEventosAdmin();
    document.getElementById("cancelarEditar")?.addEventListener("click", () => {
      document.getElementById("modalEditarEvento").style.display = "none";
    });
    document.getElementById("formEditarEvento")?.addEventListener("submit", guardarEdicionEvento);
  }
  // Eventos para visitante
  if (path === "/eventos") {
    mostrarEventosVisitante();
  }
  // Mis eventos para visitante
  if (path === "/misEventos") {
    mostrarMisEventos();
  }
}

//Autenticación y registro
async function login(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const res = await fetch(`http://localhost:3000/usuarios?username=${username}&password=${password}`);
    const data = await res.json();
    if (data.length > 0) {
      const { rol, id } = data[0];
      localStorage.setItem("logueado", true);
      localStorage.setItem("rol", rol);
      localStorage.setItem("userId", id);
      window.location.hash = rol === "admin" ? "#/homeAdmin" : "#/homeVisitante";
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  } catch {
    alert("Error al conectarse con el servidor");
  }
}
async function register(e) {
  e.preventDefault();
  const rol= document.getElementById("rol");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const res = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol, username, password })
    });
    if (!res.ok) throw new Error();
    alert("Usuario registrado exitosamente");
  } catch {
    alert("Error al registrar usuario");
  }
}
function logout() {
  localStorage.clear();
  window.location.hash = "#/";
}

//CRUD de eventos para admin
async function crearEvento(e) {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const instructor = document.getElementById("instructor").value;
  const capacidad = document.getElementById("capacidad").value;
  await fetch("http://localhost:3000/eventos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, instructor, capacidad })
  });
  alert("Evento creado");
  router();
}
async function mostrarEventosAdmin() {
  const lista = document.getElementById("listaGestionEventos");
  if (lista) {
    const eventos = await (await fetch("http://localhost:3000/eventos")).json();
    lista.innerHTML = eventos.map(ev => `
      <li>
        <strong>${ev.titulo}</strong> - ${ev.instructor} (Capacidad: ${ev.capacidad})
        <button onclick="editarEvento('${ev.id}')">Editar</button>
        <button onclick="eliminarEvento('${ev.id}')">Eliminar</button>
      </li>
    `).join("");
  }
}
window.eliminarEvento = async function(id) {
  if (confirm("¿Seguro que deseas eliminar este evento?")) {
    await fetch(`http://localhost:3000/eventos/${id}`, { method: "DELETE" });
    alert("Evento eliminado");
    router();
  }
};
window.editarEvento = async function(id) {
  const evento = await (await fetch(`http://localhost:3000/eventos/${id}`)).json();
  document.getElementById("editId").value = evento.id;
  document.getElementById("editTitulo").value = evento.titulo;
  document.getElementById("editInstructor").value = evento.instructor;
  document.getElementById("editCapacidad").value = evento.capacidad;
  document.getElementById("modalEditarEvento").style.display = "block";
};
async function guardarEdicionEvento(e) {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const titulo = document.getElementById("editTitulo").value;
  const instructor = document.getElementById("editInstructor").value;
  const capacidad = document.getElementById("editCapacidad").value;
  await fetch(`http://localhost:3000/eventos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, instructor, capacidad })
  });
  alert("Evento actualizado");
  document.getElementById("modalEditarEvento").style.display = "none";
  router();
}
//Eventos para visitante
async function mostrarEventosVisitante() {
  const lista = document.getElementById("listaEventos");
  if (lista) {
    const eventos = await (await fetch("http://localhost:3000/eventos")).json();
    lista.innerHTML = eventos.map(c => `
      <li>
        <strong>${c.titulo}</strong> - ${c.instructor} (Capacidad: ${c.capacidad})
        <button onclick="inscribirse('${c.id}', ${c.capacidad})">Inscribirme</button>
      </li>
    `).join("");
  }
}
//Inscripcion con control de capacidad
window.inscribirse = async function(eventoId, capacidad) {
  const usuarioId = localStorage.getItem("userId");
  // Verifica si ya está inscrito
  const yaInscrito = await (await fetch(`http://localhost:3000/inscripciones?eventoId=${eventoId}&usuarioId=${usuarioId}`)).json();
  if (yaInscrito.length > 0) return alert("Ya estas inscrito en este evento");
  // Verifica capacidad
  const inscripciones = await (await fetch(`http://localhost:3000/inscripciones?eventoId=${eventoId}`)).json();
  if (inscripciones.length >= capacidad) return alert("Capacidad maxima alcanzada para este evento.");
  await fetch("http://localhost:3000/inscripciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventoId, usuarioId })
  });
  alert("Inscripcion exitosa");
  router();
};
//Mis eventos para visitante
async function mostrarMisEventos() {
  const usuarioId = localStorage.getItem("userId");
  const lista = document.getElementById("listaMisEventos");
  if (lista) {
    const inscripciones = await (await fetch(`http://localhost:3000/inscripciones?usuarioId=${usuarioId}`)).json();
    const eventos = await (await fetch("http://localhost:3000/eventos")).json();
    const eventosInscritos = inscripciones.map(i => {
      const evento = eventos.find(c => String(c.id) === String(i.eventoId));
      return evento ? `<li><strong>${evento.titulo}</strong> - ${evento.instructor}</li>` : '';
    }).join("");
    lista.innerHTML = eventosInscritos || "<p>No ests inscrito en ningun evento.</p>";
  }
}
//Eventos del router
window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);