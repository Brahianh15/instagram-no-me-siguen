(async () => {
  if (window.location.origin !== "https://www.instagram.com") {
    alert("Debes ejecutar este código dentro de https://www.instagram.com");
    window.location.href = "https://www.instagram.com";
    return;
  }

  // Obtiene tu user_id directamente de la cookie de sesión
  const match = document.cookie.match(/ds_user_id=(\d+)/);
  if (!match) {
    console.error("No se encontró la sesión activa (ds_user_id). Asegúrate de haber iniciado sesión.");
    return;
  }
  const userId = match[1];

  const fetchOptions = {
    credentials: "include",
    headers: {
      "X-IG-App-ID": "936619743392459",
      "X-Requested-With": "XMLHttpRequest",
    },
    method: "GET",
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

  const fetchList = async (list, count = 25) => {
    let users = [];
    let nextMaxId = "";

    do {
      let url = `https://www.instagram.com/api/v1/friendships/${userId}/${list}/?count=${count}`;
      if (nextMaxId) url += `&max_id=${nextMaxId}`;

      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        throw new Error(`Instagram respondió con error ${res.status} al consultar ${list}. Espera unos minutos e intenta de nuevo.`);
      }

      const data = await res.json();
      if (!Array.isArray(data.users)) {
        throw new Error(`Respuesta inesperada en ${list}: ${JSON.stringify(data)}`);
      }

      users = users.concat(data.users);
      nextMaxId = data.next_max_id || "";

      if (nextMaxId) {
        const wait = random(1000, 2000);
        console.log(`Cargados ${users.length} en ${list}... esperando ${wait}ms`);
        await sleep(wait);
      }
    } while (nextMaxId);

    return users.map((u) => u.username.toLowerCase());
  };

  try {
    console.log("Iniciando consulta...");
    const followers = await fetchList("followers");
    const following = await fetchList("following");

    const followerSet = new Set(followers);
    const followingSet = new Set(following);

    const noMeSiguen = [...followingSet].filter((u) => !followerSet.has(u));
    const noSigo = [...followerSet].filter((u) => !followingSet.has(u));

    console.log("----------------------------");
    console.log(`Seguidores: ${followerSet.size} | Seguidos: ${followingSet.size}`);
    console.log(`No te siguen de vuelta (${noMeSiguen.length}):`, noMeSiguen);
    console.log(`Tú no sigues de vuelta (${noSigo.length}):`, noSigo);
  } catch (err) {
    console.error("Error ejecutando el script:", err.message);
  }
})();
