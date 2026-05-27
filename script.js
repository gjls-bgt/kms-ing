let semuaDataKamus = [];

// Memuat data CSV bertanda titik koma (;)
function muatKamus() {
    fetch('kamus.csv')
        .then(response => response.text())
        .then(data => {
            let baris = data.split('\n');
            semuaDataKamus = []; 
            for (let i = 0; i < baris.length; i++) {
                if (baris[i].trim() === "") continue;
                let kolom = baris[i].split(';');
                semuaDataKamus.push(kolom.map(item => item.trim()));
            }
            console.log("Kamus Lampung siap digunakan!");
        })
        .catch(error => {
            console.error("Gagal memuat file CSV:", error);
        });
}

function cariOtomatis() {
    let input = document.getElementById('inputKata').value.trim().toLowerCase();
    let mode = document.querySelector('input[name="mode"]:checked').value;
    let hasilBox = document.getElementById('hasilBox');
    
    if (input === "") {
        hasilBox.style.display = "none";
        return;
    }

    let apiResult = [];
    let nyowResult = [];
    let indoResult = []; // Menampung hasil bahasa Indonesia jika mode Lampung->Indo

    semuaDataKamus.forEach(baris => {
        let indo = baris[0] ? baris[0].trim() : "";
        let dialek = baris[1] ? baris[1].toLowerCase().trim() : "";
        
        // Ambil semua daftar kata Lampung (kolom ke-3 dan seterusnya)
        let kataLampungList = baris.slice(2).filter(item => item !== "").map(item => item.trim());
        let kataLampungListLower = kataLampungList.map(k => k.toLowerCase());

        if (mode === "lampung-indo") {
            // --- KATA LAMPUNG -> INDONESIA ---
            if (kataLampungListLower.includes(input)) {
                // Cukup ambil arti Indonesianya saja (kolom 0)
                if (indo) indoResult.push(indo);
            }
        } else {
            // --- KATA INDONESIA -> LAMPUNG ---
            if (indo.toLowerCase() === input && kataLampungList.length > 0) {
                let gabunganKata = kataLampungList.join(', ');
                
                if (dialek === "api") {
                    apiResult.push(gabunganKata);
                } else if (dialek === "nyow") {
                    nyowResult.push(gabunganKata);
                } else if (dialek === "") {
                    // Jika kosong, masukkan ke kedua dialek
                    apiResult.push(gabunganKata);
                    nyowResult.push(gabunganKata);
                }
            }
        }
    });

    // Tampilkan hasil ke layar berdasarkan mode yang dipilih
    hasilBox.style.display = "block";

    if (mode === "lampung-indo") {
        // Format Tampilan Lampung ke Indonesia (Hanya menampilkan arti bahasa Indonesia)
        indoResult = [...new Set(indoResult)].filter(Boolean);
        
        if (indoResult.length > 0) {
            hasilBox.innerHTML = `<div>${indoResult.join(', ')}</div>`;
        } else {
            hasilBox.innerHTML = `<span class="error">Kata tidak ditemukan.</span>`;
        }
    } else {
        // Format Tampilan Indonesia ke Lampung (Dua baris: Api & Nyow)
        apiResult = [...new Set(apiResult)].filter(Boolean);
        nyowResult = [...new Set(nyowResult)].filter(Boolean);

        if (apiResult.length > 0 || nyowResult.length > 0) {
            hasilBox.innerHTML = `
                <div><strong>A :</strong> ${apiResult.join(', ') || '-'}</div>
                <div><strong>O :</strong> ${nyowResult.join(', ') || '-'}</div>
            `;
        } else {
            hasilBox.innerHTML = `<span class="error">Kata tidak ditemukan.</span>`;
        }
    }
}
window.onload = muatKamus;