document
  .getElementById("dataForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Retrieve form values
    var item = document.getElementById("item").value;
    var username = document.getElementById("username").value;
    var userid = document.getElementById("userid").value;
    var tanggalPembelian = document.getElementById("tanggalPembelian").value;
    var metodePembayaran = document.getElementById("metodePembayaran").value;
    var totalHarga = document.getElementById("totalHarga").value;

    // Generate transaction code
    var kodeTransaksi =
      "TRXFF-" + userid.slice(-3) + Math.floor(1000 + Math.random() * 9000);

    // Populate the ticket event div with the details
    var ticketEvent = document.getElementById("ticketEvent");
    ticketEvent.innerHTML = `
        <div class="ticket-event">
            <div class="detail-header">Detail</div>
            <div class="detail-row">
                <div class="detail-label">Item</div>
                <div class="detail-itemff">${item}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Username</div>
                <div class="detail-usernameff">${username}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">User Id</div>
                <div class="detail-useridff">${userid}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tanggal Pembelian</div>
                <div class="detail-tglff">${tanggalPembelian}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Metode Pembayaran</div>
                <div class="detail-pembayaran">${metodePembayaran}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Total Harga</div>
                <div class="detail-hargaff">${totalHarga}</div>
            </div>
        </div>
        <div class="ticket-visual_ticket-number-wrapper">
            <div class="ticket-visual_ticket-number">${kodeTransaksi}</div>
        </div>
    `;
  });
