
// 1. add a budget
// 2. push budget items to the ui
// 3. recalculate both income and expense totals
// 4. recalculate the balance
// 5. clear input fields

// assignment -> income and expense divs should be percentage of the totals

class Budget {
    constructor(_desc, _amount, _type, _id = false) {
        // I used a default value for _id here so that if it's not passed,
        // it'll should default to "false"
        this.desc = _desc;
        this.amount = _amount;
        this.type = _type;

        // here I'm setting this.id based on the value of _id,
        // if it's passed (in the case of editBudget()), this.id will be _id
        // else this.id will be Date.now()

        // I'm using ternary operator here, read more on it
        !!_id ? (this.id = _id) : (this.id = Date.now());

        // I'm setting this.allBudgets to be an empty array
        this.allBudgets = [];
    }
    // properties
    // -> description
    // -> amount
    // -> type
    // -> id

    // add a budget
    addBudget() {
        // create a budget with the properties created from the constructor
        const budget = {
            desc: this.desc,
            amount: this.amount,
            type: this.type,
            id: this.id
        };
        // add new budget to this.allBudgets
        if (Storage.getBudgets()) {
            this.allBudgets = Storage.getBudgets();
        } else {
            this.allBudgets = [];
        }
        this.allBudgets.unshift(budget);

        // push the allBudget items to the db
        Storage.setBudgets(this.allBudgets);
    }
    // remove a budget
    static removeBudget(id) {
        const budgets = Storage.getBudgets();
        // filter
        const remainingBudgets = budgets.filter(budget => {
            return budget.id != id;
        });

        Storage.setBudgets(remainingBudgets);
    }

    static sumAllIncomeBudgets() {
        if (Storage.getBudgets()) {
            const allBudgets = Storage.getBudgets();
            const incomeBudgets = allBudgets.filter(budget => {
                return budget.type == "income";
            });

            let totalAmount = 0;
            for (let i = 0; i < incomeBudgets.length; i++) {
                const incomeBudget = incomeBudgets[i];
                totalAmount += parseInt(incomeBudget.amount);
            }

            console.log(totalAmount);
        }
    }

    static sumAllExpenseBudgets() {
        if (Storage.getBudgets()) {
            const allBudgets = Storage.getBudgets();
            const expenseBudgets = allBudgets.filter(budget => {
                return budget.type == "expense";
            });

            let totalAmount = 0;
            // for (let i = 0; i < incomeBudgets.length; i++) {
            // 	const incomeBudget = incomeBudgets[i];
            // 	totalAmount += parseInt(incomeBudget.amount);
            // }
            expenseBudgets.forEach(expense => {
                totalAmount += parseInt(expense.amount);
            });

            console.log(totalAmount);
        }
    }

    static sumBudgetType(type) {
        if (Storage.getBudgets()) {
            const allBudgets = Storage.getBudgets();
            const typeBudgets = allBudgets.filter(budget => {
                return budget.type == type;
            });

            let totalAmount = 0;
            typeBudgets.forEach(budget => {
                totalAmount += parseInt(budget.amount);
            });

            return totalAmount;
        }
    }

    // edit a budget
    editBudget() {
        //1. get all budgets from db
        this.allBudgets = Storage.getBudgets();

        // filter out the budget to be edited
        this.allBudgets.forEach(budget => {
            if (budget.id == this.id) {
                const editedBudget = {
                    desc: this.desc,
                    amount: this.amount,
                    type: this.type,
                    id: this.id
                };

                this.allBudgets.splice(this.allBudgets.indexOf(budget), 1, editedBudget);
            }
        });

        // push the allBudget items to the db
        Storage.setBudgets(this.allBudgets);
    }
}

class UI {
    // load budgets to the ui
    static loadBudgets() {
        if (Storage.getBudgets()) {
            const allBudgets = Storage.getBudgets();
            const budgetsDOM = document.querySelector(".items");
            const incomeTotals = document.getElementById("incomeTotals");
            const expenseTotals = document.getElementById("expenseTotals");
            const incomeBudgetTotal = Budget.sumBudgetType("income");
            const expenseBudgetTotal = Budget.sumBudgetType("expense");
            const balanceHTML = document.getElementById("budgetBalance");
            const balance = incomeBudgetTotal - expenseBudgetTotal;

            // budgets lists
            let budgetsHTML = "";
            let n = 1;
            allBudgets.forEach(budget => {
                budgetsHTML += `<li class="${budget.type} item" data-item=${budget.id}>
                <div class="row text-capitalize mb-3">
                  <div class="col-sm-1"><span>${n}</span></div>
                  <div class="col-sm-6"><span>${budget.desc}</span></div>
                  <div class="col-sm-3"><span>July 25th</span></div>
                  <div class="col-sm-2"><span>&#x20a6;${
                    budget.amount
                    }</span></div>
                </div>
                <!-- edit and delete btns -->
                <div class="icons">
                  <span><i class="fa fa-edit text-success mr-2"></i></span>
                  <span><i class="fa fa-trash text-tomato"></i></span>
                </div>
              </li>`;
                n++;
            });

            budgetsDOM.innerHTML = budgetsHTML;

            // income and expense totals
            incomeTotals.innerHTML = `&#x20a6; ${incomeBudgetTotal}`;
            expenseTotals.innerHTML = `&#x20a6; ${expenseBudgetTotal}`;

            // balance
            balanceHTML.innerHTML = `&#x20a6; ${balance}`;
        } else {
            return false;
        }
    }

    static editBudget(id, submitEditBudgetCallback) {
        // the essence of this callback is to run after all
        // the elements have been put inside the form

        //1. get budgets out of db
        const budgets = Storage.getBudgets();

        //2a. filter out the one with the id
        const budgetInArray = budgets.filter(budget => {
            return budget.id == id;
        });

        //2b. only one matches, get that out of the array
        const budget = budgetInArray[0];

        //3. push details to ui
        const editBudgetForm = document.querySelector("#editBudgetModal form");

        const editBudgetFormHTML = `<div class="form-group">
							<label class="font-weight-bold text-danger" for="type">Type of Item</label>
							<select class="form-control" name="type" id="type">
								<option value="income" ${
            budget.type == "income" ? "selected" : ""
            }>income</option>
								<option value="expense" ${
            budget.type == "expense" ? "selected" : ""
            }>expense</option>
							</select>
						</div>
						<div class="form-group">
							<label class="font-weight-bold text-danger" for="desc">Description</label>
							<input class="form-control" type="text" name="desc"
								id="desc" value="${budget.desc}" placeholder="Enter your item description"/>
						</div>

						<div class="form-group">
							<label class="font-weight-bold text-danger" for="amount">Enter the amount</label>
              <input class="form-control" type="number" name="amount" value="${
            budget.amount
            }" 
              id="amount" placeholder="Enter the amount"/>
            </div>
            <input name="id" type="hidden" value="${budget.id}">
						<button class="btn btn-primary">Edit Budget</button>
          </<div>`;

        editBudgetForm.innerHTML = editBudgetFormHTML;

        //6. simulate a click event on the hidden btn to launch editBudget modal
        const modalTrigger = document.querySelector('a[href="#editBudgetModal"]');
        modalTrigger.click();

        // once the ui has been fixed, run the callback
        submitEditBudgetCallback();
    }
}

class Storage {
    // set budgets into local storage
    static setBudgets(budgets) {
        if (localStorage.setItem("budgets", JSON.stringify(budgets))) {
            return true;
        } else {
            return [];
        }
    }
    // get budgets from the local storage
    static getBudgets() {
        if (localStorage.getItem("budgets")) {
            return JSON.parse(localStorage.getItem("budgets"));
        } else {
            return false;
        }
    }
}

// APP LOGIC
// load budget contents in db after DOM as loaded
document.addEventListener("DOMContentLoaded", e => {
    UI.loadBudgets();

    const deleteIcons = document.querySelectorAll(".fa-trash");
    const editIcons = document.querySelectorAll(".fa-edit");
    const submitAddBudget = document.getElementById("submitAddBudget");
    const closeAddBtn = document.getElementById("closeAddBudgetModalBtn");
    const closeEditBtn = document.getElementById("closeEditBudgetModalBtn");

    // add budget
    submitAddBudget.addEventListener("submit", e => {
        e.preventDefault();

        // get all input values
        const amount = submitAddBudget.querySelector("#amount").value;
        const desc = submitAddBudget.querySelector("#desc").value;
        const type = submitAddBudget.querySelector("#type").value;

        // a. validate input values

        // b. close modal
        closeAddBtn.click();

        // c. add the budget
        const budget = new Budget(desc, amount, type);
        budget.addBudget();

        // d. reload page
        location.reload();
    });

    // remove budget
    deleteIcons.forEach(icon => {
        icon.addEventListener("click", e => {
            const budgetHTML = icon.parentElement.parentElement.parentElement;
            const budgetId = budgetHTML.dataset.item;

            // remove budget
            Budget.removeBudget(budgetId);

            // reload page
            location.reload();
        });
    });

    // edit budget (ui)
    editIcons.forEach(icon => {
        icon.addEventListener("click", e => {
            const budgetHTML = icon.parentElement.parentElement.parentElement;
            const budgetId = budgetHTML.dataset.item;

            // 1. launch modal to take inputs
            UI.editBudget(budgetId, submitEditBudgetCallback);
        });
    });

    // edit budget submit callback
    const submitEditBudgetCallback = () => {
        const submitEditBudget = document.getElementById("submitEditBudget");

        // 1. add submit event listener to run once form is submitted
        submitEditBudget.addEventListener("submit", e => {
            e.preventDefault();

            // 2. get all input values
            const amount = submitEditBudget.querySelector("#amount").value;
            const desc = submitEditBudget.querySelector("#desc").value;
            const type = submitEditBudget.querySelector("#type").value;
            const budgetId = submitEditBudget.querySelector("input[type='hidden'").value;

            // 3. validate input values

            // 4. close modal
            closeEditBtn.click();

            // 5. store inputs
            const budget = new Budget(desc, amount, type, budgetId);
            budget.editBudget();

            // 6. reload page
            location.reload();
        });
    };
});