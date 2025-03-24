document.addEventListener("DOMContentLoaded", () => {
    const products = [
        { id: 1, name: "Cotton Shirt", category: "Clothing", imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGSOefpWHZmbjDEjB2SnVirWQRwKz9utt4Ag&s", price: 10.95 },
        { id: 2, name: "Lenovo Laptop", category: "Electronics", imgURL: "https://www.transparentpng.com/download/laptop/9oRuDc-refreshed-pavilion-gaming-series-launching-next-month.png", price: 104.99 },
        { id: 3, name: "Robo Cleaner", category: "Electronics", imgURL: "https://www.pngfind.com/pngs/m/84-846109_robotic-vacuum-cleaner-png-free-download-x-mini.png", price: 65.90 },
        { id: 4, name: "Smart Watch", category: "Electronics", imgURL: "https://png.pngtree.com/png-vector/20240309/ourmid/pngtree-the-smartwatch-banner-png-image_11919210.png", price: 49.73 },
        { id: 5, name: "Leather Jacket", category: "Clothing", imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_h6hGyquETpcdpkBomQReC0RAKjloWhG66g&s", price: 29.99 },
        { id: 6, name: "Bluetooth Headphones", category: "Electronics", imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJhij_1bHVoqVmoZgtTE7P5gafEEIlcM214A&s", price: 35.50 },
        { id: 7, name: "Wireless Mouse", category: "Accessories", imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSL09UkrDgZHmtdxHL0aG5fGcUb1ZQ24Npqw&s", price: 4.29 },
        { id: 8, name: "Electric Kettle", category: "Home Appliances", imgURL: "https://png.pngtree.com/png-clipart/20231104/original/pngtree-electric-kettle-png-image_13504455.png", price: 31.70 },
        { id: 9, name: "Sneakers", category: "Footwear", imgURL: "https://i.pinimg.com/474x/47/b4/0d/47b40d607bd173069468a6f10b53e073.jpg", price: 59.99 },
        { id: 10, name: "Digital Camera", category: "Electronics", imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKVLy42aeJ_DJ7094vjJkPUBPdmNzOYoRmQw&s", price: 125.99 }
    ];
    

    const productContainer = document.getElementById("product-list") ;
    products.forEach( product => {
        const productItem = document.createElement("option") ;
        productItem.value = product.id ;
        productItem.textContent = product.name ;
        productContainer.appendChild(productItem) ;
    } ) ;
    // console.log( productContainer.childNodes ) ;

    function couponCode(length = 6, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') {
        const result = [];
        const vals = new Uint8Array(length);
        window.crypto.getRandomValues(vals);
        for ( let i = 0; i < length; i++ )
            result.push( chars[ vals[i] % chars.length ] ) ;
        
        return result.join(''); 
    }

    let cart = [] ;
    const cartItems = document.querySelector(".cart-items") ; // MISTAKE ; I didn't write '.' FOR class
    const selectionBtn = document.getElementById("check-selection") ;
    const emptyCartMsg = document.getElementById("empty-cart") ;
    const preReceipt = document.querySelector(".pre-receipt") ;
    const shipCharges = document.getElementById("shipping") ;
    const curCoupon = couponCode() ;
    const totalPriceDisplay = document.getElementById("total-price") ;
    const checkoutButton = document.getElementById("checkout-btn") ;

    selectionBtn.addEventListener("click", () => {
        const curProduct = products.find( product => product.id === parseInt( productContainer.value ) ) ; // Can also select like "productContainer.options[productContainer.selectedIndex]"/
        if( !curProduct || cart.find( (product) => curProduct.id === product.id ) ) return ;
        else if( cart.length === 0 ) emptyCartMsg.classList.add("hidden") ;
        
        const separation = document.createElement("div") ;
        separation.classList.add("separation") ;
        cartItems.appendChild( separation ) ;

        const cartItem = document.createElement("div");
        cartItem.classList.add("item");
        cartItem.setAttribute("data-id", curProduct.id); // Store product id on the cart item element ; It will be stored as string as id.

        const img = document.createElement("img");
        img.src = curProduct.imgURL ;
        cartItem.appendChild(img);

        // Add product details
        const text = document.createElement("div");
        text.classList.add("text");
        const category = document.createElement("p");
        category.textContent = curProduct.category ;
        text.appendChild(category);
        const productName = document.createElement("p");
        productName.textContent = curProduct.name ;
        text.appendChild(productName);
        cartItem.appendChild(text);

        // Add quantity controls
        const qtyControls = document.createElement("div");

        const decreaseBtn = document.createElement("a");
        decreaseBtn.classList.add("dec-btn") ; // Instead of adding "id's" as it will be duplicates on multiple elements ; USE classes with event-delegation.
        decreaseBtn.href = "#";
        decreaseBtn.textContent = "-";
        qtyControls.appendChild(decreaseBtn);

        const qty = document.createElement("span");
        qty.classList.add("qty") ;
        qty.textContent = "1" ; // Default qty.
        qtyControls.appendChild(qty);

        const increaseBtn = document.createElement("a");
        increaseBtn.classList.add( "inc-btn" ) ;
        increaseBtn.href = "#";
        increaseBtn.textContent = "+";
        qtyControls.appendChild(increaseBtn);

        cartItem.appendChild(qtyControls);

        // Add the price and remove button
        const priceDiv = document.createElement("div");
        priceDiv.classList.add("price-div");

        const price = document.createElement("span");
        price.classList.add("item-price") ;
        price.innerHTML = `&euro; ${curProduct.price.toFixed(2)}` ;
        priceDiv.appendChild(price);

        const closeBtn = document.createElement("button");
        closeBtn.classList.add("close-btn") ;
        closeBtn.innerHTML = "&#10005;";
        priceDiv.appendChild(closeBtn);
        cartItem.appendChild(priceDiv);

        cartItems.appendChild(cartItem);
        cart.push( {...curProduct , qty: 1 , unitPrice: curProduct.price } ) ; // Add qty as key also with unitPrice and Hard-copy for curProduct.
        updateCart() ;
    } ) ;

    // Event delegation for increment and decrement buttons as INDIVIDUAL querySelectors won't work.
    cartItems.addEventListener("click", (event) => {
        const cartItem = event.target.closest(".item") ; // Find the closest item element to "target".
        if( !cartItem )
            return ;

        const qtyElement = cartItem.querySelector(".qty") ;
        let curQty = parseInt( qtyElement.textContent ) ;
        // console.log( event.target ) ;

        if ( event.target.classList.contains("inc-btn") )
            curQty++;
        else if ( event.target.classList.contains("dec-btn") ) {
            if( curQty === 1 ) {
                removeCartItem( cartItem ) ;
                return ;
            }
            curQty-- ;
        }
        // else if( event.target.classList.contains("close-btn") ) {
        else if( event.target.tagName === "BUTTON" ) { // Another way.
            removeCartItem( cartItem ) ;
            return ;
        }
        // let itemPrice = parseFloat( itemPriceSpan.textContent.slice(1) ) ; // slice() to avoid the &euro; symbol. This will NOT work as I hadn't stored unitPrice.
        const productId = parseInt( cartItem.getAttribute("data-id") ) ;
        const cartProduct = cart.find(product => product.id === productId);
        const unitPrice = cartProduct.unitPrice ;

        let totalItemPrice = (unitPrice * curQty) ; // MISTAKE ; Don't do toFixed(2) here as it can add multiple decimalPoints as JS will convert it into string.
        qtyElement.textContent = curQty;
        cartItem.querySelector(".item-price").innerHTML = `&euro; ${ totalItemPrice.toFixed(2) }`;

        cartProduct.qty = curQty;
        cartProduct.price = totalItemPrice ;
        updateCart();
    } ) ;

    checkoutButton.addEventListener("click", () => {
        if( cart.length !== 0 ) {
            const toast = document.createElement("div");
            toast.classList.add("toast");
            document.body.appendChild(toast);

            toast.textContent = "Checkout failed as I am currently learning backend. Please check back later!";
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 4000);
            // alert(`Checkout Failed as I don't know the bankend much yet`) ;   
        }
    } ) ;

    document.getElementById("arrow-btn").addEventListener("click", () => {
        if( cart.length === 0 )
            return ;

        const couponInput = document.getElementById("coupon") ;
        if( couponInput.value === curCoupon ) {  
            const options = shipCharges.querySelectorAll("option");  // Get all option elements inside shipCharges
            options.forEach( option => option.remove() ) ;
            const newOption = document.createElement("option") ;
            newOption.innerHTML = `FREE - &euro; 0.00` ;
            shipCharges.appendChild(newOption) ;

            couponInput.classList.add("hidden") ;
            document.getElementById("arrow-btn").classList.add("hidden") ;
            couponInput.value = "" ;
            updateCart() ;
        }
    } ) ;

    function removeCartItem( cartItem ) {
        const separation = cartItem.previousElementSibling ;
        if( separation !== null && separation.classList.contains("separation") ) // Even though I know its previous elementSibling but AND-condition for extra verification. ANOTHER MISTAKE ; contains() don't take '.' as its a object so it expects CLASS NAME directly.
            cartItems.removeChild(separation) ;

        const productId = parseInt( cartItem.getAttribute("data-id") ) ; // Get the ID from the cartItem.
        cart = cart.filter( product => product.id !== productId ) ; // Both must be INT ; so if done by INNER-HTML ; Then need to check via product.id !== parseInt( productId ) as without this it will also work with != NOT !==. OR make your product "id" a string.
        cartItems.removeChild( cartItem ) ;
        if( cart.length === 0 )
            emptyCartMsg.classList.remove("hidden") ;
        
        updateCart() ;
    }

    function updateCart() {
        let totalPrice = 0 , count = 0 ;
        cart.forEach( ( product ) => { 
            totalPrice += product.price ; 
            count += product.qty
        } ) ;

        // console.log( totalPrice , count ) ;
        preReceipt.innerHTML = `<p>ITEMS ${count}</p>
                                <p>&euro; ${totalPrice.toFixed(2)}</p>` ;
        
        const selectedOptionText = shipCharges.options[shipCharges.selectedIndex].text;
        let price = selectedOptionText.split("€")[1] ; // Splits into array before AND after "€" parts. [1] to get afterPart i.e. price.
        if( cart.length === 0 )
            price = 0 ;
        totalPrice += parseFloat( price || 0 ) ;
        totalPriceDisplay.innerHTML = `&euro; ${totalPrice.toFixed(2)}`;
    }
} ) ;