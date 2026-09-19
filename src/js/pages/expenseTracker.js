export function initExpenseTracker() {
  const balanceEl = document.getElementById("balance");
  const incomeAmountEl = document.getElementById("income-amount");
  const expenseAmountEl = document.getElementById("expense-amount");
  const transactionListEl = document.getElementById("transaction-list");
  const transactionFormEl = document.getElementById("transaction-form");
  const descriptionEl = document.getElementById("description");
  const amountEl = document.getElementById("amount");

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  transactionFormEl.addEventListener("submit", addTransaction);

  // به‌جای onclick سراسری، از event delegation استفاده می‌کنیم
  transactionListEl.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    if (!deleteBtn) return;

    const id = Number(deleteBtn.dataset.id);
    removeTransaction(id);
  });

  function addTransaction(e) {
    e.preventDefault();

    const description = descriptionEl.value.trim();
    const amount = parseFloat(amountEl.value);

    transactions.push({
      id: Date.now(),
      description,
      amount,
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateTransactionList();
    updateSummary();

    transactionFormEl.reset();
  }

  function updateTransactionList() {
    transactionListEl.innerHTML = "";

    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach((transaction) => {
      const transactionEl = createTransactionElement(transaction);
      transactionListEl.appendChild(transactionEl);
    });
  }

function createTransactionElement(transaction) {
  const isIncome = transaction.amount > 0;

  const li = document.createElement("li");
  li.className = `
    flex items-center justify-between
    bg-white px-4 py-3 mb-2
    rounded-lg shadow-sm hover:shadow-md transition-shadow
  `;

  li.innerHTML = `
    <span class="flex items-center gap-3 flex-1 overflow-hidden">
      <span class="font-medium text-orca-950 whitespace-nowrap overflow-hidden text-ellipsis">
        ${transaction.description}
      </span>
      <span class="font-bold whitespace-nowrap ${isIncome ? "text-orca-navy-300" : "text-orca-red-500"}">
        ${formatCurrency(transaction.amount)}
      </span>
    </span>
    <button
      class="bg-transparent border-none text-orca-400 text-lg cursor-pointer px-2 py-1 rounded-md transition-colors hover:bg-orca-red-500/10 hover:text-orca-red-500"
      data-id="${transaction.id}"
    >
      x
    </button>
  `;

  return li;
}

  function updateSummary() {
    // 100, -50, 200, -200 => 50
    const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

    const income = transactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const expenses = transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    balanceEl.textContent = formatCurrency(balance);
    incomeAmountEl.textContent = formatCurrency(income);
    expenseAmountEl.textContent = formatCurrency(expenses);
  }

  function formatCurrency(number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
  }

  function removeTransaction(id) {
    transactions = transactions.filter((transaction) => transaction.id !== id);

    localStorage.setItem("transactions", JSON.stringify(transactions));

    updateTransactionList();
    updateSummary();
  }

  updateTransactionList();
  updateSummary();
}