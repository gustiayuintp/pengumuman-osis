let masterJadwal = {};

document.addEventListener("DOMContentLoaded", () => {
    // Set tanggal default ke hari ini
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    document.getElementById('inputTanggal').value = `${yyyy}-${mm}-${dd}`;

    // Load data JSON
    fetch('jadwal.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Gagal memuat jadwal.json");
            }
            return response.json();
        })
        .then(data => {
            masterJadwal = data;
            generateFromSchedule();
            renderTablesMaster();
        })
        .catch(error => {
            console.error('Error loading JSON:', error);
            document.getElementById('previewText').textContent = "⚠️ Gagal memuat file jadwal.json. Pastikan file berada di folder yang sama dan diakses melalui web server / Live Server.";
        });
});

// Menghitung minggu ke-1 hingga 4 dalam bulan
function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDay.getDay();
    let week = Math.ceil((date.getDate() + dayOfWeek) / 7);
    if (week > 4) week = 4; // Maksimal minggu ke-4
    return week;
}

function getNamaHariIndo(dayIndex) {
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return hari[dayIndex];
}

function formatTanggalIndo(date) {
    const hariCustom = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return `${hariCustom[date.getDay()]} ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

// Format penambahan karakter @ di akhir nama
function formatNamaWithAt(namaList) {
    if (!namaList || namaList.length === 0) return "1. -";
    return namaList.map((nama, idx) => `${idx + 1}. ${nama} @`).join('\n');
}

// Fungsi Utama Generate Pengumuman
function generateFromSchedule() {
    if (!masterJadwal.bendera) return;

    const tglValue = document.getElementById('inputTanggal').value;
    if (!tglValue) return;

    const date = new Date(tglValue);
    const hariKey = getNamaHariIndo(date.getDay());
    const weekNum = getWeekOfMonth(date);
    const weekKey = `minggu_${weekNum}`;

    document.getElementById('infoDeteksi').textContent = `${hariKey}, Minggu ke-${weekNum}`;

    if (hariKey === 'Sabtu' || hariKey === 'Minggu') {
        document.getElementById('previewText').textContent = `⚠️ Hari ${hariKey} tidak ada jadwal piket sekolah.`;
        return;
    }

    // Ambil data piket bendera berdasarkan rotasi minggu
    const benderaMinggu = masterJadwal.bendera[weekKey] || {};
    const benderaHari = benderaMinggu[hariKey] || {};
    const bPagi = formatNamaWithAt(benderaHari.pagi);
    const bSiang = formatNamaWithAt(benderaHari.siang);

    const operatorMinggu = masterJadwal.operator[weekKey] || {};
    const operatorHari = operatorMinggu[hariKey] || {};
    const oPagi = formatNamaWithAt(operatorHari.pagi);
    const oSiang = formatNamaWithAt(operatorHari.siang);

    const polisiMinggu = masterJadwal.polisi_sekolah[weekKey] || {};
    const polisiHari = polisiMinggu[hariKey] || {};
    const pPagi = formatNamaWithAt(polisiHari.pagi);
    const pSore = formatNamaWithAt(polisiHari.siang);

    const polatikMinggu = masterJadwal.polatik ? masterJadwal.polatik[weekKey] || {} : {};
    const polatikHari = polatikMinggu[hariKey] || {};
    const poPagi = formatNamaWithAt(polatikHari.pagi);
    const poSiang = formatNamaWithAt(polatikHari.siang);

    const template = `📢 *PENGUMUMAN PIKET OSIS – BENDERA, OPERATOR, POLISI SEKOLAH & POLATIK*

📅 Hari/Tanggal: ${formatTanggalIndo(date)}
☀️ Sesi: *Pagi dan Siang*

Diberitahukan kepada nama-nama yang tercantum di bawah ini untuk melaksanakan tugas piket pada *sesi Pagi dan Siang*

👥 *DAFTAR PETUGAS* 

*Piket bendera PAGI*:
${bPagi}

*Piket bendera SIANG*:
${bSiang}

*Operator PAGI*:
${oPagi}

*Operator SIANG*:
${oSiang}

*Polisi Sekolah PAGI*:
${pPagi}

*Polisi Sekolah SORE*:
${pSore}

*Polatik PAGI*:
${poPagi}

*Polatik SIANG*:
${poSiang}


⚠️ *PERINGATAN:*
- Wajib hadir tepat waktu sesuai jadwal.
- Pastikan tugas bendera, operator, polisi sekolah, dan polatik sudah dipersiapkan.
- Jangan meninggalkan tugas tanpa izin.
- Jika berhalangan hadir, wajib mencari pengganti dan menginformasikan kepada penanggung jawab.
- Polisi sekolah dan polatik diwajibkan membawa PDH.

Mohon dilaksanakan dengan disiplin dan penuh tanggung jawab.

Terima kasih. 🙏`;

    document.getElementById('previewText').textContent = template;
}

// Salin Teks ke Clipboard
function copyToClipboard() {
    const textToCopy = document.getElementById('previewText').textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const alertBox = document.getElementById('alertCopy');
        alertBox.classList.remove('d-none');
        setTimeout(() => { alertBox.classList.add('d-none'); }, 2500);
    });
}

// Render Tabel Master Jadwal di Tab Kanan
function renderTablesMaster() {
    const tableClass = "w-full text-xs text-left text-slate-700 border-collapse";
    const theadClass = "bg-slate-100 uppercase text-slate-600 font-bold border-b border-slate-200";
    const trClass = "hover:bg-slate-50 transition-colors h-11 border-b border-slate-200/80";
    const tdHariClass = "p-3 font-semibold text-slate-800 w-1/5 align-middle";
    const tdContentClass = "p-3 w-2/5 align-middle";

    // Helper fungsi render tabel per minggu
    const renderWeeklyTables = (containerId, sourceData, badgeBg, badgeText, badgeBorder) => {
        const container = document.getElementById(containerId);
        if (container && sourceData) {
            let html = '';
            for (let i = 1; i <= 4; i++) {
                const weekKey = `minggu_${i}`;
                const weekData = sourceData[weekKey];
                if (!weekData) continue;

                html += `<div class="space-y-2">
                    <span class="inline-block px-2.5 py-1 ${badgeBg} ${badgeText} font-bold text-xs rounded-md border ${badgeBorder}">
                        Minggu ${i}
                    </span>
                    <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <table class="${tableClass}">
                            <thead class="${theadClass}">
                                <tr>
                                    <th class="p-3 w-1/5">Hari</th>
                                    <th class="p-3 w-2/5">Sesi Pagi</th>
                                    <th class="p-3 w-2/5">Sesi Siang</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-200">`;
                for (const [hari, data] of Object.entries(weekData)) {
                    html += `<tr class="${trClass}">
                        <td class="${tdHariClass}">${hari}</td>
                        <td class="${tdContentClass}">${data.pagi ? data.pagi.join(', ') : '-'}</td>
                        <td class="${tdContentClass}">${data.siang ? data.siang.join(', ') : '-'}</td>
                    </tr>`;
                }
                html += `</tbody></table></div></div>`;
            }
            container.innerHTML = html;
        }
    };

    // 1. Render Bendera (4 Minggu)
    renderWeeklyTables('containerBenderaTables', masterJadwal.bendera, 'bg-blue-50', 'text-blue-700', 'border-blue-200');

    // 2. Render Operator (4 Minggu)
    renderWeeklyTables('containerOperatorTables', masterJadwal.operator, 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200');

    // 3. Render Polisi Sekolah (4 Minggu)
    renderWeeklyTables('containerPolisiTables', masterJadwal.polisi_sekolah, 'bg-rose-50', 'text-rose-700', 'border-rose-200');

    // 4. Render Polatik (4 Minggu)
    renderWeeklyTables('containerPolatikTables', masterJadwal.polatik, 'bg-amber-50', 'text-amber-700', 'border-amber-200');
}