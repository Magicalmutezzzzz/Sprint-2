// ===========================================
// SMART EXPENSE TRACKER
// Part 1 - Variables & Initialization
// ===========================================

// ---------- State ----------

let salary = 0;
let expenses = [];
let currency = "INR";
let exchangeRate = 1;
let originalSalary = 0;
let originalExpenses = [];
let expenseChart;

// ---------- DOM Elements ----------

const salaryInput = document.getElementById("salary");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");

const addExpenseBtn = document.getElementById("addExpense");
const expenseList = document.getElementById("expenseList");

const salaryDisplay = document.getElementById("salaryDisplay");
const expenseDisplay = document.getElementById("expenseDisplay");
const balanceDisplay = document.getElementById("balanceDisplay");

const error = document.getElementById("error");
const warning = document.getElementById("warning");

const currencySelect = document.getElementById("currency");
const downloadPDF = document.getElementById("downloadPDF");

// ---------- Currency Symbols ----------

const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£"
};

// ===========================================
// Local Storage
// ===========================================

function saveData() {

    localStorage.setItem(
        "salary",
        JSON.stringify(salary)
    );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
    originalSalary = salary;
    originalExpenses = [...expenses];

}

function loadData() {

    salary = JSON.parse(
        localStorage.getItem("salary")
    ) || 0;

    expenses = JSON.parse(
        localStorage.getItem("expenses")
    ) || [];

    originalSalary = salary;

    originalExpenses = [...expenses];

    salaryInput.value = salary || "";

}

// ===========================================
// Calculations
// ===========================================

function calculateTotalExpense() {

    return expenses.reduce((total, expense) => {

        return total + expense.amount;

    }, 0);

}

function calculateBalance() {

    return salary - calculateTotalExpense();

}

// ===========================================
// Currency Formatting
// ===========================================

function formatMoney(amount) {

    return symbols[currency] + amount.toFixed(2);

}

// ===========================================
// Application Initialization
// ===========================================

window.onload = () => {

    loadData();

    renderExpenses();

    updateSummary();

    createChart();

}
// ===========================================
// PART 2 - Expense Management
// ===========================================

// ---------- Validation ----------
function validateInputs() {

    const salaryValue = Number(salaryInput.value);
    const expenseName = expenseNameInput.value.trim();
    const expenseAmount = Number(expenseAmountInput.value);

    error.textContent = "";

    if (salaryValue <= 0 || isNaN(salaryValue)) {

        error.textContent = "Please enter a valid salary.";
        return false;

    }

    if (expenseName === "") {

        error.textContent = "Expense name cannot be empty.";
        return false;

    }

    if (expenseAmount <= 0 || isNaN(expenseAmount)) {

        error.textContent = "Please enter a valid expense amount.";
        return false;

    }

    return true;

}

// ===========================================
// Add Expense
// ===========================================

function addExpense() {

    if (!validateInputs()) return;

    salary = Number(salaryInput.value);

    const expense = {

        id: Date.now(),

        name: expenseNameInput.value.trim(),

        amount: Number(expenseAmountInput.value)

    };

    expenses.push(expense);

    expenseNameInput.value = "";
    expenseAmountInput.value = "";

    saveData();

    renderExpenses();

    updateSummary();

    updateChart();

}

// ===========================================
// Render Expense Table
// ===========================================

function renderExpenses() {

    expenseList.innerHTML = "";

    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">
                    No Expenses Added Yet
                </td>
            </tr>
        `;

        return;

    }

    expenses.forEach(expense => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${expense.name}</td>

            <td>${formatMoney(expense.amount)}</td>

            <td>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;

        expenseList.appendChild(row);

    });

}

// ===========================================
// Delete Expense
// ===========================================

function deleteExpense(id) {

    expenses = expenses.filter(expense => expense.id !== id);

    saveData();

    renderExpenses();

    updateSummary();

    updateChart();

}

// ===========================================
// Button Event
// ===========================================

addExpenseBtn.addEventListener("click", function (e) {

    e.preventDefault();

    addExpense();

});
// ===========================================
// PART 3 - Dashboard Summary, Alerts & Chart
// ===========================================

// Update Summary Cards
function updateSummary() {

    const totalExpense = calculateTotalExpense();
    const balance = calculateBalance();

    salaryDisplay.textContent = formatMoney(salary);
    expenseDisplay.textContent = formatMoney(totalExpense);
    balanceDisplay.textContent = formatMoney(balance);

    checkThreshold();

}

// ===========================================
// Low Balance Alert
// ===========================================

function checkThreshold() {

    const balance = calculateBalance();

    if (salary === 0) {

        warning.classList.add("hidden");
        balanceDisplay.classList.remove("balance-low");
        return;

    }

    const threshold = salary * 0.10;

    if (balance <= threshold) {

        warning.classList.remove("hidden");

        balanceDisplay.classList.add("balance-low");

        warning.innerHTML =
        `
        ⚠ <strong>Low Balance Warning!</strong><br>
        Your remaining balance is below 10% of your salary.
        `;

    }
    else {

        warning.classList.add("hidden");

        balanceDisplay.classList.remove("balance-low");

    }

}

// ===========================================
// Chart.js
// ===========================================

function createChart() {

    const ctx = document.getElementById("expenseChart");

    expenseChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [

                "Remaining Balance",

                "Expenses"

            ],

            datasets: [

                {

                    data: [

                        calculateBalance(),

                        calculateTotalExpense()

                    ],

                    backgroundColor: [

                        "#10B981",

                        "#EF4444"

                    ],

                    borderColor: "#ffffff",

                    borderWidth: 3,

                    hoverOffset: 15

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        font: {

                            size: 15,

                            family: "Poppins"

                        }

                    }

                }

            }

        }

    });

}

// ===========================================
// Update Chart
// ===========================================

function updateChart() {

    if (!expenseChart) return;

    expenseChart.data.datasets[0].data = [

        calculateBalance(),

        calculateTotalExpense()

    ];

    expenseChart.update();

}

// ===========================================
// Currency Converter
// ===========================================
currencySelect.addEventListener("change", async function () {

    const selectedCurrency = this.value;

    if (selectedCurrency === currency) return;

    try {

        if (selectedCurrency === "INR") {

            currency = "INR";

            exchangeRate = 1;

            salary = originalSalary;

            expenses = [...originalExpenses];

            updateSummary();

            renderExpenses();

            updateChart();

            return;

        }

        const response = await fetch(
            `https://api.frankfurter.dev/v2/rate/INR/${selectedCurrency}`
        );

        const data = await response.json();

        exchangeRate = data.rate;

        currency = selectedCurrency;

        salary = originalSalary * exchangeRate;

        expenses = originalExpenses.map(expense => ({

            ...expense,

            amount: expense.amount * exchangeRate

        }));

        updateSummary();

        renderExpenses();

        updateChart();

    }

    catch (error) {

        console.error(error);

        alert("Unable to convert currency.");

    }

});


// ===========================================
// PART 4 - PDF Report & Final Utilities
// ===========================================

// Download PDF Report

downloadPDF.addEventListener("click", generatePDF);

function generatePDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Smart Expense Tracker Report", 20, y);

    y += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text(`Total Salary : ${formatMoney(salary)}`, 20, y);

    y += 10;

    doc.text(`Total Expense : ${formatMoney(calculateTotalExpense())}`, 20, y);

    y += 10;

    doc.text(`Remaining Balance : ${formatMoney(calculateBalance())}`, 20, y);

    y += 20;

    doc.setFont("helvetica", "bold");
    doc.text("Expense List", 20, y);

    y += 10;

    doc.setFont("helvetica", "normal");

    if (expenses.length === 0) {

        doc.text("No Expenses Added", 20, y);

    } else {

        expenses.forEach((expense, index) => {

            doc.text(
                `${index + 1}. ${expense.name} - ${formatMoney(expense.amount)}`,
                20,
                y
            );

            y += 10;

            if (y > 270) {

                doc.addPage();

                y = 20;

            }

        });

    }

    doc.save("Expense_Report.pdf");

}

// ===========================================
// Optional Clear All Function
// ===========================================

function clearAllData() {

    if (!confirm("Are you sure you want to delete all expenses?")) {

        return;

    }

    salary = 0;

    expenses = [];

    salaryInput.value = "";

    expenseNameInput.value = "";

    expenseAmountInput.value = "";

    localStorage.removeItem("salary");
    localStorage.removeItem("expenses");

    renderExpenses();

    updateSummary();

    updateChart();

}

// ===========================================
// Utility Function
// ===========================================

function resetError() {

    error.textContent = "";

}

// Remove error when typing

salaryInput.addEventListener("input", resetError);

expenseNameInput.addEventListener("input", resetError);

expenseAmountInput.addEventListener("input", resetError);

// ===========================================
// Save Salary Automatically
// ===========================================

salaryInput.addEventListener("change", () => {

    const value = Number(salaryInput.value);

    if (value > 0) {

        salary = value;

        saveData();

        updateSummary();

        updateChart();

    }

});

// ===========================================
// Enter Key Support
// ===========================================

expenseAmountInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        addExpense();

    }

});

// ===========================================
// Final Initializer
// ===========================================

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    renderExpenses();

    updateSummary();

    createChart();

});

