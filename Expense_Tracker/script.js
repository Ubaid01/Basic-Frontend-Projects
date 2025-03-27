document.addEventListener("DOMContentLoaded", () => {
    const transForm = document.querySelector(".trans-form") ;
    const totalBalance = document.getElementById("total-balance") ;
    const income = document.getElementById("income") ;
    const exp = document.getElementById("exp") ;
    const nameInput = document.getElementById("name") ;
    const amountInput = document.getElementById("amount") ;
    const categoryInput = document.getElementById("category") ;
    const transDate = document.getElementById("trans-date") ;
    const transList = document.querySelector(".trans-list") ;
    const filterButton = document.getElementById("filter") ;

    let transactions = JSON.parse( localStorage.getItem("transactions") ) || [] ;
    renderTransactions() ;

    /* Default event of "submit" for <form> */
    transForm.addEventListener("submit" , (e) => {
        e.preventDefault() ; // Prevent form from submitting to local by reloading page.

        const description = nameInput.value.trim() ;
        const amount = ( !amountInput.value ) ? 0 : parseFloat( amountInput.value ) ; /* Although we have mentioned it as number ; but it will be returned has "string". */
        const category = categoryInput.value ;
        const date = transDate.value ;

        if( description === "" || isNaN(amount) || date === "" || category === "" ) {
            alert("Please fill all the fields.") ;
            return ;
        }

        const curTrans = {
            id: Date.now() ,
            name: description,
            amount: amount, 
            category: category,
            date: date
        } ;

        nameInput.value = "" ;
        amountInput.value = "" ;
        categoryInput.value = "" ; // Reset the category input to the default option with value = "" as in HTML.
        transDate.value = "" ;

        document.querySelector(".trans-table").classList.remove("hidden") ;
        transactions.push(curTrans) ;
        saveToLocal() ;
        renderTransactions() ;
    } ) ;

    filterButton.addEventListener("change" , (e) => {
        e.preventDefault() ;
        const filterType = filterButton.value ; // As byDefault value of "All is set to " empty-str "".
        renderTransactions( filterType ) ;
    } ) ;

    transList.addEventListener("click" , (event) => {
        const selectedList = event.target.closest("tr") ;
        
        if( selectedList ) {
            const rowId = selectedList.getAttribute("row-id") ;
            // transactions.forEach( (trans) => console.log( typeof trans.id ) ) ; // Date() is saved as Num so thats why was giving "undefined" error.
            const selectedTrans = transactions.find( (trans) => trans.id === parseInt(rowId) ) ;

            if( event.target.classList.contains("edit") ) {
                nameInput.value = selectedTrans.name ;
                amountInput.value = selectedTrans.amount ;
                categoryInput.value = selectedTrans.category ;
                transDate.value = selectedTrans.date ;
                amountInput.focus() ;
                transactions = transactions.filter( trans => trans.id !== selectedTrans.id ) ; // OR can use transactions.splice( index , 1 ) Remove '1' elements from index ; if i != -1 .
            }
            else if( event.target.classList.contains("delete") )
                transactions = transactions.filter( trans => trans.id !== selectedTrans.id ) ;

            if( transactions.length == 0 )
                document.querySelector(".trans-table").classList.add("hidden") ;
            
            saveToLocal() ;
            renderTransactions() ;
        }
    } ) ;

    function renderTransactions( filterType="" ) {

        const filteredTrans = filterType === "" ? transactions : transactions.filter( (trans) => trans.category === filterType ) ;
        transList.innerHTML = "" ; // Rerender each time.

        if( filteredTrans.length > 0 )
            document.querySelector(".trans-table").classList.remove("hidden") ;

        filteredTrans.forEach( (trans) => {
            const { name , amount , category , date } = trans ;
            const transHTML = `
                <tr>
                    <td>${name}</td>
                    <td>${amount > 0 ? `Income` : amount < 0 ? `Expense` : `Neutral`}</td>
                    <td>${amount}</td>
                    <td>${category}</td>
                    <td>${date}</td>
                    <td>
                        <button class="edit">Edit</button>
                        <button class="delete">Delete</button>
                    </td>
                </tr> ` ;
            
            // Convert the string HTML into a DOM element and then append it
            const transRow = document.createElement('tr');
            transRow.setAttribute("row-id", trans.id) ; // For editing / deleting individual transactions.
            transRow.innerHTML = transHTML;
            transList.appendChild(transRow) ;

            // transList.innerHTML += transHTML ; // OR can do like this.
        } ) ;
        evaluateTotal() ;
    }

    function evaluateTotal() {
        const incomeAmount = transactions.filter( (trans) => trans.amount > 0 ).reduce( (acc, trans) => acc + trans.amount, 0) ;
        income.textContent = `$${incomeAmount.toFixed(2)}`;

        const expAmount = transactions.filter( (trans) => trans.amount < 0 ).reduce( (acc, trans) => acc + trans.amount, 0) ;
        exp.textContent = `$${expAmount.toFixed(2)}`;

        const totalAmount = incomeAmount + expAmount ;
        totalBalance.textContent = `$${ totalAmount.toFixed(2) } ` ;

        totalBalance.style.color = totalAmount > 0 ? "green" : totalAmount < 0 ? "red" : "grey" ;
    }

    function saveToLocal() {
        localStorage.setItem("transactions" , JSON.stringify(transactions) ) ;
    }
} ) ;