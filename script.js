document.addEventListener("DOMContentLoaded", () => {
    const loanTermSelect = document.getElementById('loan-term');
    for (let i = 1; i <= 30; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.text = `${i} Tahun`;
        loanTermSelect.appendChild(option);
    }

    const loanAmountInput = document.getElementById('loan-amount');
    loanAmountInput.addEventListener('input', () => {
        let value = loanAmountInput.value.replace(/\D/g, '');
        loanAmountInput.value = new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(value);
    });
});

function calculateLoan() {
    const principal = parseInt(document.getElementById('loan-amount').value.replace(/\D/g, ''));
    const interestType = document.getElementById('interest-type').value;
    const rate = parseFloat(document.getElementById('interest-rate').value) / 100;
    const term = parseInt(document.getElementById('loan-term').value);

    let interest, total, installment, details;
    switch (interestType) {
        case 'simple':
            interest = (principal * rate * term);
            total = principal + interest;
            installment = total / (term * 12);
            details = calculateSimpleInterestDetails(principal, rate, term, installment);
            break;
        case 'compound':
            total = principal * Math.pow(1 + rate, term);
            interest = total - principal;
            installment = total / (term * 12);
            details = calculateCompoundInterestDetails(principal, rate, term, installment);
            break;
        case 'annuity':
            const monthlyRate = rate / 12;
            installment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -term * 12));
            total = installment * term * 12;
            interest = total - principal;
            details = calculateAnnuityDetails(principal, rate, term, installment);
            break;
    }

    document.getElementById('result').innerHTML = `
        <h2>Informasi Detail</h2>
        <p>Suku bunga/Tahun: ${(rate * 100).toFixed(2)}%</p>
        <p>Suku bunga floating/Tahun: ${(rate * 100).toFixed(2)}%</p>
        <p>Lama Pinjaman: ${term * 12} Bulan</p>
        <p>Jumlah Pinjaman Maksimal: Rp ${new Intl.NumberFormat('id-ID').format(principal)}</p>
        <h3>Detail Angsuran</h3>
        <p>Angsuran Bulanan: Rp ${new Intl.NumberFormat('id-ID').format(installment.toFixed(2))}</p>
        <p>Total Bunga: Rp ${new Intl.NumberFormat('id-ID').format(interest.toFixed(2))}</p>
        <p>Total Pembayaran: Rp ${new Intl.NumberFormat('id-ID').format(total.toFixed(2))}</p>
    `;

    document.getElementById('installment-details').innerHTML = `
        <h3>Rincian Angsuran</h3>
        <table>
            <tr>
                <th>Bulan</th>
                <th>Sisa Pinjaman</th>
                <th>Porsi Pokok</th>
                <th>Porsi Bunga</th>
                <th>Angsuran</th>
                <th>Bunga</th>
            </tr>
            ${details}
        </table>
    `;
}

function calculateSimpleInterestDetails(principal, rate, term, installment) {
    let details = '';
    const monthlyRate = rate / 12;
    const totalInterest = principal * rate * term;
    const monthlyInterest = totalInterest / (term * 12);

    let balance = principal;

    for (let month = 1; month <= term * 12; month++) {
        // Menghitung porsi pokok
        let principalPortion = installment - monthlyInterest;

        // Pastikan porsi pokok tidak melebihi sisa pinjaman
        if (principalPortion > balance) {
            principalPortion = balance;
        }

        // Kurangi sisa pinjaman dengan porsi pokok
        balance -= principalPortion;

        // Pastikan balance tidak negatif
        if (balance < 0) {
            balance = 0;
        }

        // Tambahkan detail ke tabel
        details += `
            <tr>
                <td>${month}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(balance.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(principalPortion.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(monthlyInterest.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(installment.toFixed(2))}</td>
                <td>${(monthlyRate * 100).toFixed(2)}%</td>
            </tr>
        `;

        // Jika sisa pinjaman sudah 0, hentikan loop
        if (balance === 0) {
            break;
        }
    }

    return details;
}



//bunga majemuk

for (let month = 1; month <= term * 12; month++) {
    // Perhitungan porsi bunga untuk bulan ini
    const interestPortion = balance * monthlyRate;

    // Perhitungan porsi pokok yang harus dibayar bulan ini
    const principalPortion = installment - interestPortion;

    if (balance <= 0) {
        break;  // Menghentikan loop jika saldo pinjaman sudah 0
    }

    if (balance < principalPortion) {
        // Jika sisa saldo lebih kecil dari porsi pokok, sesuaikan cicilan untuk menyelesaikan pinjaman
        details += `
            <tr>
                <td>${month}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(0)}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(balance.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(interestPortion.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(installment.toFixed(2))}</td>
                <td>${(monthlyRate * 100).toFixed(2)}%</td>
            </tr>
        `;
        balance = 0;  // Menyetel saldo menjadi nol setelah pembayaran terakhir
    } else {
        // Mengurangi saldo dengan porsi pokok
        balance -= principalPortion;
        details += `
            <tr>
                <td>${month}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(balance.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(principalPortion.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(interestPortion.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(installment.toFixed(2))}</td>
                <td>${(monthlyRate * 100).toFixed(2)}%</td>
            </tr>
        `;
    }
}



//bunga anunitas
function calculateAnnuityDetails(principal, rate, term, installment) {
    let details = '';
    let balance = principal;
    const monthlyRate = rate / 12;
    for (let month = 1; month <= term * 12; month++) {
        const interestPortion = balance * monthlyRate;
        let principalPortion = Math.min(installment - interestPortion, balance);
        balance -= principalPortion;

        details += `
            <tr>
                <td>${month}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(balance.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(principalPortion.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(interestPortion.toFixed(2))}</td>
                <td>Rp ${new Intl.NumberFormat('id-ID').format(installment.toFixed(2))}</td>
                <td>${(monthlyRate * 100).toFixed(2)}%</td>
            </tr>
        `;

        // Jika balance sudah mencapai 0, berhenti
        if (balance === 0) {
            break;
        }
    }
    return details;
}
