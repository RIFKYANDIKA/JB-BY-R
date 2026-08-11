let accounts = [

  {
    id: 1,

    title: "FF Sultan Bundle",

    price: 1200000,

    level: 70,

    rank: "Heroic",

    seller: "Rifky",

    detail:
      "Bundle langka dan koleksi skin."
  },

  {
    id: 2,

    title: "FF Old Account",

    price: 850000,

    level: 65,

    rank: "Grandmaster",

    seller: "Andi",

    detail:
      "Akun lama dengan koleksi event."
  }

];


let currentAccount = null;


function rupiah(number) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(number);

}


function showHome() {

  document.getElementById("app").innerHTML = `

    <section class="hero">

      <h1>
        JB BY R
      </h1>

      <p>
        Marketplace jual beli akun
        Free Fire.
      </p>

      <button
        class="btn primary"
        onclick="sellAccount()"
      >
        + Jual Akun
      </button>

    </section>

    <h2>
      ðŸ”¥ Akun tersedia
    </h2>

    <div
      id="accounts"
      class="grid"
    ></div>

  `;

  renderAccounts();

}


function renderAccounts() {

  const container =
    document.getElementById(
      "accounts"
    );

  container.innerHTML =
    accounts.map(account => `

      <div class="card">

        <h2>
          ${account.title}
        </h2>

        <p>
          Level ${account.level}
        </p>

        <p>
          Rank:
          ${account.rank}
        </p>

        <p>
          ${account.detail}
        </p>

        <div class="price">

          ${rupiah(account.price)}

        </div>

        <small>
          Penjual:
          ${account.seller}
        </small>

        <button
          class="btn primary full"
          onclick="openAccount(${account.id})"
        >
          Lihat / Beli
        </button>

      </div>

    `).join("");

}


function openAccount(id) {

  currentAccount =
    accounts.find(
      account =>
        account.id === id
    );

  openModal(`

    <h2>
      ${currentAccount.title}
    </h2>

    <p>
      Level:
      ${currentAccount.level}
    </p>

    <p>
      Rank:
      ${currentAccount.rank}
    </p>

    <p>
      ${currentAccount.detail}
    </p>

    <h2>
      ${rupiah(
        currentAccount.price
      )}
    </h2>

    <button
      class="btn primary full"
      onclick="checkout()"
    >
      ðŸ›’ BELI SEKARANG
    </button>

    <button
      class="btn full"
      onclick="offerPrice()"
    >
      ðŸ’¬ TAWAR HARGA
    </button>

  `);

}


function checkout() {

  openModal(`

    <h2>
      ðŸ’³ Pembayaran
    </h2>

    <p>
      ${currentAccount.title}
    </p>

    <h2>
      ${rupiah(
        currentAccount.price
      )}
    </h2>

    <p>
      Setelah menekan tombol,
      kamu akan diarahkan ke
      halaman pembayaran resmi.
    </p>

    <button
      class="btn primary full"
      onclick="createPayment()"
    >
      BAYAR SEKARANG
    </button>

  `);

}


async function createPayment() {

  const name =
    prompt(
      "Nama pembeli:"
    );

  if (!name) return;


  const email =
    prompt(
      "Email:"
    );

  if (!email) return;


  const phone =
    prompt(
      "Nomor HP:"
    ) || "";


  const response =
    await fetch(
      "/api/create-payment",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({

            accountId:
              currentAccount.id,

            accountName:
              currentAccount.title,

            amount:
              currentAccount.price,

            customerName:
              name,

            customerEmail:
              email,

            customerPhone:
              phone

          })

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    alert(
      data.error ||
      "Pembayaran gagal."
    );

    return;

  }


  window.location.href =
    data.paymentUrl;

}


function offerPrice() {

  const price =
    prompt(
      "Masukkan harga tawaran:"
    );

  if (!price) return;

  alert(
    "Tawaran Rp " +
    price +
    " telah dikirim."
  );

}


function sellAccount() {

  openModal(`

    <h2>
      Jual Akun
    </h2>

    <input
      id="accountName"
      class="input"
      placeholder="Nama akun"
    >

    <input
      id="accountPrice"
      class="input"
      type="number"
      placeholder="Harga"
    >

    <input
      id="accountLevel"
      class="input"
      placeholder="Level"
    >

    <input
      id="accountRank"
      class="input"
      placeholder="Rank"
    >

    <textarea
      id="accountDetail"
      class="input"
      placeholder="Detail akun"
    ></textarea>

    <button
      class="btn primary full"
      onclick="publishAccount()"
    >
      TERBITKAN AKUN
    </button>

  `);

}


function publishAccount() {

  const name =
    document.getElementById(
      "accountName"
    ).value;

  const price =
    Number(
      document.getElementById(
        "accountPrice"
      ).value
    );

  const level =
    document.getElementById(
      "accountLevel"
    ).value;

  const rank =
    document.getElementById(
      "accountRank"
    ).value;

  const detail =
    document.getElementById(
      "accountDetail"
    ).value;


  if (!name || !price) {

    alert(
      "Nama dan harga wajib diisi."
    );

    return;

  }


  accounts.unshift({

    id: Date.now(),

    title: name,

    price,

    level,

    rank,

    detail,

    seller: "Saya"

  });


  closeModal();

  showHome();

}


async function showOrders() {

  const response =
    await fetch(
      "/api/orders"
    );

  const orders =
    await response.json();


  document.getElementById(
    "app"
  ).innerHTML = `

    <h2>
      ðŸ§¾ Pesanan Saya
    </h2>

    ${
      orders.length

      ?

      orders.map(order => `

        <div class="panel">

          <h3>
            ${order.account_name}
          </h3>

          <div class="price">
            ${rupiah(order.amount)}
          </div>

          <p>
            Status:
            <b>
              ${order.status}
            </b>
          </p>

        </div>

      `).join("")

      :

      `<div class="panel">
        Belum ada pesanan.
      </div>`

    }

  `;

}


function showProfile() {

  openModal(`

    <h2>
      ðŸ‘¤ Profil
    </h2>

    <p>
      JB BY R Marketplace
    </p>

    <p>
      Login Google dan database
      production dapat ditambahkan
      di backend.
    </p>

  `);

}


function openModal(content) {

  document.getElementById(
    "modalContent"
  ).innerHTML = content;

  document.getElementById(
    "modal"
  ).classList.add("open");

}


function closeModal() {

  document.getElementById(
    "modal"
  ).classList.remove("open");

}


showHome();let accounts = [

  {
    id: 1,

    title: "FF Sultan Bundle",

    price: 1200000,

    level: 70,

    rank: "Heroic",

    seller: "Rifky",

    detail:
      "Bundle langka dan koleksi skin."
  },

  {
    id: 2,

    title: "FF Old Account",

    price: 850000,

    level: 65,

    rank: "Grandmaster",

    seller: "Andi",

    detail:
      "Akun lama dengan koleksi event."
  }

];


let currentAccount = null;


function rupiah(number) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }
  ).format(number);

}


function showHome() {

  document.getElementById("app").innerHTML = `

    <section class="hero">

      <h1>
        JB BY R
      </h1>

      <p>
        Marketplace jual beli akun
        Free Fire.
      </p>

      <button
        class="btn primary"
        onclick="sellAccount()"
      >
        + Jual Akun
      </button>

    </section>

    <h2>
      ðŸ”¥ Akun tersedia
    </h2>

    <div
      id="accounts"
      class="grid"
    ></div>

  `;

  renderAccounts();

}


function renderAccounts() {

  const container =
    document.getElementById(
      "accounts"
    );

  container.innerHTML =
    accounts.map(account => `

      <div class="card">

        <h2>
          ${account.title}
        </h2>

        <p>
          Level ${account.level}
        </p>

        <p>
          Rank:
          ${account.rank}
        </p>

        <p>
          ${account.detail}
        </p>

        <div class="price">

          ${rupiah(account.price)}

        </div>

        <small>
          Penjual:
          ${account.seller}
        </small>

        <button
          class="btn primary full"
          onclick="openAccount(${account.id})"
        >
          Lihat / Beli
        </button>

      </div>

    `).join("");

}


function openAccount(id) {

  currentAccount =
    accounts.find(
      account =>
        account.id === id
    );

  openModal(`

    <h2>
      ${currentAccount.title}
    </h2>

    <p>
      Level:
      ${currentAccount.level}
    </p>

    <p>
      Rank:
      ${currentAccount.rank}
    </p>

    <p>
      ${currentAccount.detail}
    </p>

    <h2>
      ${rupiah(
        currentAccount.price
      )}
    </h2>

    <button
      class="btn primary full"
      onclick="checkout()"
    >
      ðŸ›’ BELI SEKARANG
    </button>

    <button
      class="btn full"
      onclick="offerPrice()"
    >
      ðŸ’¬ TAWAR HARGA
    </button>

  `);

}


function checkout() {

  openModal(`

    <h2>
      ðŸ’³ Pembayaran
    </h2>

    <p>
      ${currentAccount.title}
    </p>

    <h2>
      ${rupiah(
        currentAccount.price
      )}
    </h2>

    <p>
      Setelah menekan tombol,
      kamu akan diarahkan ke
      halaman pembayaran resmi.
    </p>

    <button
      class="btn primary full"
      onclick="createPayment()"
    >
      BAYAR SEKARANG
    </button>

  `);

}


async function createPayment() {

  const name =
    prompt(
      "Nama pembeli:"
    );

  if (!name) return;


  const email =
    prompt(
      "Email:"
    );

  if (!email) return;


  const phone =
    prompt(
      "Nomor HP:"
    ) || "";


  const response =
    await fetch(
      "/api/create-payment",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({

            accountId:
              currentAccount.id,

            accountName:
              currentAccount.title,

            amount:
              currentAccount.price,

            customerName:
              name,

            customerEmail:
              email,

            customerPhone:
              phone

          })

      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    alert(
      data.error ||
      "Pembayaran gagal."
    );

    return;

  }


  window.location.href =
    data.paymentUrl;

}


function offerPrice() {

  const price =
    prompt(
      "Masukkan harga tawaran:"
    );

  if (!price) return;

  alert(
    "Tawaran Rp " +
    price +
    " telah dikirim."
  );

}


function sellAccount() {

  openModal(`

    <h2>
      Jual Akun
    </h2>

    <input
      id="accountName"
      class="input"
      placeholder="Nama akun"
    >

    <input
      id="accountPrice"
      class="input"
      type="number"
      placeholder="Harga"
    >

    <input
      id="accountLevel"
      class="input"
      placeholder="Level"
    >

    <input
      id="accountRank"
      class="input"
      placeholder="Rank"
    >

    <textarea
      id="accountDetail"
      class="input"
      placeholder="Detail akun"
    ></textarea>

    <button
      class="btn primary full"
      onclick="publishAccount()"
    >
      TERBITKAN AKUN
    </button>

  `);

}


function publishAccount() {

  const name =
    document.getElementById(
      "accountName"
    ).value;

  const price =
    Number(
      document.getElementById(
        "accountPrice"
      ).value
    );

  const level =
    document.getElementById(
      "accountLevel"
    ).value;

  const rank =
    document.getElementById(
      "accountRank"
    ).value;

  const detail =
    document.getElementById(
      "accountDetail"
    ).value;


  if (!name || !price) {

    alert(
      "Nama dan harga wajib diisi."
    );

    return;

  }


  accounts.unshift({

    id: Date.now(),

    title: name,

    price,

    level,

    rank,

    detail,

    seller: "Saya"

  });


  closeModal();

  showHome();

}


async function showOrders() {

  const response =
    await fetch(
      "/api/orders"
    );

  const orders =
    await response.json();


  document.getElementById(
    "app"
  ).innerHTML = `

    <h2>
      ðŸ§¾ Pesanan Saya
    </h2>

    ${
      orders.length

      ?

      orders.map(order => `

        <div class="panel">

          <h3>
            ${order.account_name}
          </h3>

          <div class="price">
            ${rupiah(order.amount)}
          </div>

          <p>
            Status:
            <b>
              ${order.status}
            </b>
          </p>

        </div>

      `).join("")

      :

      `<div class="panel">
        Belum ada pesanan.
      </div>`

    }

  `;

}


function showProfile() {

  openModal(`

    <h2>
      ðŸ‘¤ Profil
    </h2>

    <p>
      JB BY R Marketplace
    </p>

    <p>
      Login Google dan database
      production dapat ditambahkan
      di backend.
    </p>

  `);

}


function openModal(content) {

  document.getElementById(
    "modalContent"
  ).innerHTML = content;

  document.getElementById(
    "modal"
  ).classList.add("open");

}


function closeModal() {

  document.getElementById(
    "modal"
  ).classList.remove("open");

}


showHome();
