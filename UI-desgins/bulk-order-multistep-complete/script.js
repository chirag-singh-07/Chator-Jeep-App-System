const restaurants = [
  {
    id: 1,
    name: "Yellow Bowl Kitchen",
    distance: 1.2,
    rating: 4.7,
    eta: "15–20 min",
    menu: [
      { id: "y1", name: "Paneer Butter Masala", price: 240 },
      { id: "y2", name: "Veg Biryani", price: 190 },
      { id: "y3", name: "Dal Tadka", price: 160 },
      { id: "y4", name: "Butter Naan", price: 45 },
    ]
  },
  {
    id: 2,
    name: "Spice Route",
    distance: 2.1,
    rating: 4.6,
    eta: "20–25 min",
    menu: [
      { id: "s1", name: "Paneer Butter Masala", price: 230 },
      { id: "s2", name: "Chicken Biryani", price: 260 },
      { id: "s3", name: "Jeera Rice", price: 140 },
      { id: "s4", name: "Gulab Jamun", price: 90 },
    ]
  },
  {
    id: 3,
    name: "Urban Tiffin Co.",
    distance: 3.4,
    rating: 4.5,
    eta: "25–30 min",
    menu: [
      { id: "u1", name: "Veg Biryani", price: 180 },
      { id: "u2", name: "Chole Rice", price: 170 },
      { id: "u3", name: "Paneer Wrap", price: 150 },
      { id: "u4", name: "Masala Chaas", price: 70 },
    ]
  }
];

const state = {
  step: 1,
  searchMode: "restaurant",
  selectedRestaurant: null,
  items: {},
  address: "",
  contactName: "",
  contactPhone: "",
  note: "",
  date: "",
  time: "13:00"
};

const $ = (id) => document.getElementById(id);
const searchInput = $("searchInput");
const resultList = $("resultList");
const menuCard = $("menuCard");
const menuList = $("menuList");
const selectedItems = $("selectedItems");

function formatMoney(v){ return `₹${Math.round(v).toLocaleString("en-IN")}`; }

function renderResults(){
  const q = searchInput.value.trim().toLowerCase();
  if(!q){
    resultList.innerHTML = restaurants
      .sort((a,b)=>a.distance-b.distance)
      .map(r => restaurantCard(r, "Nearest"))
      .join("");
    bindRestaurantCards();
    return;
  }

  if(state.searchMode === "restaurant"){
    const matches = restaurants
      .filter(r => r.name.toLowerCase().includes(q))
      .sort((a,b)=>a.distance-b.distance);
    resultList.innerHTML = matches.length
      ? matches.map(r => restaurantCard(r, "Nearest")).join("")
      : `<div class="empty-state">No nearby restaurant found.</div>`;
    bindRestaurantCards();
  } else {
    const matches = [];
    restaurants.forEach(r => {
      r.menu.forEach(item => {
        if(item.name.toLowerCase().includes(q)){
          matches.push({restaurant:r,item});
        }
      });
    });
    matches.sort((a,b)=>a.restaurant.distance-b.restaurant.distance);
    resultList.innerHTML = matches.length
      ? matches.map(({restaurant,item}) => `
        <button class="result-card food-result" data-rid="${restaurant.id}" data-itemid="${item.id}">
          <div class="restaurant-thumb">${item.name.charAt(0)}</div>
          <div class="copy">
            <strong>${item.name}</strong>
            <p>${restaurant.name} • ${restaurant.rating} ★ • ${restaurant.eta}</p>
            <div class="menu-price">${formatMoney(item.price)}</div>
          </div>
          <span class="distance">${restaurant.distance} km</span>
        </button>`).join("")
      : `<div class="empty-state">No nearby restaurant has this food item.</div>`;

    document.querySelectorAll(".food-result").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const r = restaurants.find(x => x.id === +btn.dataset.rid);
        state.selectedRestaurant = r;
        openMenu(r);
        const item = r.menu.find(x => x.id === btn.dataset.itemid);
        addItem(item, r);
      });
    });
  }
}

function restaurantCard(r,badge){
  return `
    <button class="result-card restaurant-result" data-id="${r.id}">
      <div class="restaurant-thumb">${r.name.charAt(0)}</div>
      <div class="copy">
        <strong>${r.name}</strong>
        <p>${r.rating} ★ • ${r.eta}</p>
      </div>
      <span class="distance">${r.distance} km</span>
    </button>`;
}

function bindRestaurantCards(){
  document.querySelectorAll(".restaurant-result").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const r = restaurants.find(x => x.id === +btn.dataset.id);
      state.selectedRestaurant = r;
      openMenu(r);
    });
  });
}

function openMenu(r){
  $("selectedRestaurantName").textContent = r.name;
  $("selectedRestaurantMeta").textContent = `${r.distance} km away • ${r.rating} ★ • ${r.eta}`;
  menuList.innerHTML = r.menu.map(item=>`
    <div class="menu-item">
      <div>
        <h3>${item.name}</h3>
        <p>Available for bulk ordering</p>
        <div class="menu-price">${formatMoney(item.price)}</div>
      </div>
      <button class="add-btn" data-item="${item.id}">+</button>
    </div>
  `).join("");
  menuCard.classList.remove("hidden");
  document.querySelectorAll(".add-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const item = r.menu.find(x=>x.id===btn.dataset.item);
      addItem(item,r);
    });
  });
  menuCard.scrollIntoView({behavior:"smooth",block:"start"});
}

function addItem(item, restaurant){
  if(!state.items[item.id]){
    state.items[item.id] = { ...item, qty: 10, restaurantName: restaurant.name };
  } else {
    state.items[item.id].qty += 1;
  }
  renderSelected();
}

function renderSelected(){
  const items = Object.values(state.items);
  $("selectedCount").textContent = items.length;
  $("bottomValue").textContent = `${items.length} item${items.length===1?"":"s"}`;
  if(!items.length){
    selectedItems.className = "selected-list empty-state";
    selectedItems.textContent = "No items selected yet.";
    return;
  }
  selectedItems.className = "selected-list";
  selectedItems.innerHTML = items.map(item=>`
    <div class="selected-item">
      <div>
        <h3>${item.name}</h3>
        <p>${item.restaurantName} • ${formatMoney(item.price)} each</p>
        <button class="remove-btn" data-remove="${item.id}">Remove</button>
      </div>
      <div class="qty-box">
        <button data-minus="${item.id}">−</button>
        <strong>${item.qty}</strong>
        <button data-plus="${item.id}">+</button>
      </div>
    </div>`).join("");

  document.querySelectorAll("[data-minus]").forEach(btn=>btn.onclick=()=>{
    const x=state.items[btn.dataset.minus]; x.qty=Math.max(1,x.qty-1); renderSelected();
  });
  document.querySelectorAll("[data-plus]").forEach(btn=>btn.onclick=()=>{
    state.items[btn.dataset.plus].qty++; renderSelected();
  });
  document.querySelectorAll("[data-remove]").forEach(btn=>btn.onclick=()=>{
    delete state.items[btn.dataset.remove]; renderSelected();
  });
}

document.querySelectorAll(".segment").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".segment").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    state.searchMode = btn.dataset.mode;
    $("searchHint").textContent = state.searchMode === "restaurant"
      ? "Search restaurant names to see their menu. Results are sorted by nearest first."
      : "Search a food item to find the nearest restaurant that has it on the menu.";
    renderResults();
  });
});

searchInput.addEventListener("input",renderResults);
$("clearSearch").onclick=()=>{searchInput.value="";renderResults();};
$("changeRestaurant").onclick=()=>{menuCard.classList.add("hidden");searchInput.focus();};

function setMinDate(){
  const d = new Date();
  d.setDate(d.getDate()+1);
  const min = d.toISOString().split("T")[0];
  $("deliveryDate").min = min;
  $("deliveryDate").value = min;
  state.date = min;
}
setMinDate();

$("deliveryDate").addEventListener("change",e=>state.date=e.target.value);
$("deliveryTime").addEventListener("change",e=>state.time=e.target.value);

$("addAddressBtn").onclick=()=>$("addressForm").classList.toggle("hidden");
$("saveAddressBtn").onclick=()=>{
  const house=$("houseInput").value.trim(),street=$("streetInput").value.trim(),city=$("cityInput").value.trim(),pin=$("pinInput").value.trim();
  if(!house||!street||!city||!pin){alert("Please complete the address.");return;}
  state.address = `${house}, ${street}, ${city} - ${pin}`;
  $("addressLabel").textContent="Saved delivery address";
  $("addressText").textContent=state.address;
  $("addressForm").classList.add("hidden");
};

$("useLocationBtn").onclick=()=>{
  $("addressLabel").textContent="Fetching current location...";
  $("addressText").textContent="Using device location access.";
  setTimeout(()=>{
    state.address="Current location • Near City Center, Silvassa";
    $("addressLabel").textContent="Current location";
    $("addressText").textContent=state.address;
  },700);
};

function validateStep1(){
  const items=Object.values(state.items);
  state.contactName=$("contactName").value.trim();
  state.contactPhone=$("contactPhone").value.trim();
  state.note=$("orderNote").value.trim();
  state.date=$("deliveryDate").value;
  state.time=$("deliveryTime").value;
  if(!items.length) return "Select at least one food item.";
  if(!state.date||!state.time) return "Choose delivery date and time.";
  if(!state.address) return "Select or add a delivery address.";
  if(!state.contactName) return "Enter contact name.";
  if(state.contactPhone.replace(/\D/g,"").length<10) return "Enter a valid phone number.";
  return "";
}

function goToStep(step){
  state.step=step;
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(`step${step}`)?.classList.add("active");
  if(step===2) buildReview();
  if(step===3) buildBilling();
  updateProgress();
  window.scrollTo({top:0,behavior:"smooth"});
}

function updateProgress(){
  document.querySelectorAll(".progress-step").forEach(el=>{
    const n=+el.dataset.progress;
    el.classList.toggle("active",n===state.step);
    el.classList.toggle("complete",n<state.step);
  });
  const lines=document.querySelectorAll(".progress-line");
  lines.forEach((l,i)=>l.classList.toggle("complete",state.step>i+1));
  $("headerTitle").textContent = state.step===1?"Build your order":state.step===2?"Review your order":"Confirm & pay";
  $("bottomLabel").textContent = state.step===1?"Selected":state.step===2?"Ready to pay":"Total";
  $("primaryBtn").innerHTML = state.step===1
    ? `Continue <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>`
    : state.step===2
      ? `Continue to payment <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>`
      : `Pay with Razorpay <svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>`;
}

function buildReview(){
  const items=Object.values(state.items);
  $("reviewItems").innerHTML=items.map(item=>`
    <div class="review-item">
      <div>
        <h3>${item.name}</h3>
        <p>${item.restaurantName} • ${formatMoney(item.price)} each</p>
        <button class="remove-btn" data-review-remove="${item.id}">Remove</button>
      </div>
      <div class="qty-box">
        <button data-review-minus="${item.id}">−</button>
        <strong>${item.qty}</strong>
        <button data-review-plus="${item.id}">+</button>
      </div>
    </div>`).join("");
  $("reviewSchedule").textContent=`${state.date} at ${state.time}`;
  $("reviewAddress").textContent=state.address;
  $("reviewName").textContent=state.contactName;
  $("reviewPhone").textContent=`+91 ${state.contactPhone}`;
  $("reviewNote").textContent=state.note||"No note";

  document.querySelectorAll("[data-review-minus]").forEach(btn=>btn.onclick=()=>{
    state.items[btn.dataset.reviewMinus].qty=Math.max(1,state.items[btn.dataset.reviewMinus].qty-1); buildReview(); renderSelected();
  });
  document.querySelectorAll("[data-review-plus]").forEach(btn=>btn.onclick=()=>{
    state.items[btn.dataset.reviewPlus].qty++; buildReview(); renderSelected();
  });
  document.querySelectorAll("[data-review-remove]").forEach(btn=>btn.onclick=()=>{
    delete state.items[btn.dataset.reviewRemove]; buildReview(); renderSelected();
  });
  $("bottomValue").textContent=`${items.length} item${items.length===1?"":"s"}`;
}

function calcBill(){
  const subtotal=Object.values(state.items).reduce((s,i)=>s+i.price*i.qty,0);
  const handling=Math.round(subtotal*0.02);
  const delivery=149;
  const discount=Math.round(subtotal*0.08);
  const total=subtotal+handling+delivery-discount;
  return{subtotal,handling,delivery,discount,total};
}

function buildBilling(){
  const items=Object.values(state.items);
  $("billingItems").innerHTML=items.map(item=>`
    <div class="billing-item">
      <div style="display:flex;justify-content:space-between;gap:12px">
        <div><strong>${item.name}</strong><p style="font-size:10px;color:#999;margin-top:3px">${item.qty} × ${formatMoney(item.price)}</p></div>
        <strong>${formatMoney(item.qty*item.price)}</strong>
      </div>
    </div>`).join("");
  const b=calcBill();
  $("subtotal").textContent=formatMoney(b.subtotal);
  $("handling").textContent=formatMoney(b.handling);
  $("deliveryFee").textContent=formatMoney(b.delivery);
  $("discount").textContent=`-${formatMoney(b.discount)}`;
  $("grandTotal").textContent=formatMoney(b.total);
  $("finalSchedule").textContent=`${state.date} at ${state.time}`;
  $("finalAddress").textContent=state.address;
  $("finalContact").textContent=`${state.contactName} • +91 ${state.contactPhone}`;
  $("bottomValue").textContent=formatMoney(b.total);
}

document.querySelectorAll("[data-edit-step]").forEach(btn=>btn.onclick=()=>goToStep(1));

$("primaryBtn").onclick=()=>{
  if(state.step===1){
    const err=validateStep1();
    if(err){alert(err);return;}
    goToStep(2);
  }else if(state.step===2){
    if(!Object.keys(state.items).length){alert("Add at least one item.");goToStep(1);return;}
    goToStep(3);
  }else if(state.step===3){
    simulatePayment();
  }
};

$("backBtn").onclick=()=>{
  if($("resultScreen").classList.contains("active")){showStepAfterResult(3);return;}
  if(state.step>1) goToStep(state.step-1);
};

function simulatePayment(){
  $("primaryBtn").disabled=true;
  $("primaryBtn").textContent="Opening Razorpay...";
  setTimeout(()=>{
    const success=Math.random()>0.25;
    showPaymentResult(success);
    $("primaryBtn").disabled=false;
  },900);
}

function showPaymentResult(success){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $("resultScreen").classList.add("active");
  $("bottomBar").classList.add("hidden");
  $("resultCard").classList.toggle("failure",!success);
  $("resultEyebrow").textContent=success?"PAYMENT SUCCESSFUL":"PAYMENT FAILED";
  $("resultTitle").textContent=success?"Bulk order confirmed!":"Payment could not be completed";
  $("resultText").textContent=success
    ?"Your bulk order has been placed successfully. You’ll receive confirmation shortly."
    :"Your payment was not completed. Your order details are still saved, so you can try again.";
  $("resultIcon").innerHTML=success
    ? `<svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-8"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`;
  $("orderId").textContent=`BO-${Math.floor(100000+Math.random()*900000)}`;
  $("retryBtn").classList.toggle("hidden",success);
  $("doneBtn").textContent=success?"Done":"Back to order";
  window.scrollTo({top:0,behavior:"smooth"});
}

function showStepAfterResult(step){
  $("resultScreen").classList.remove("active");
  $("bottomBar").classList.remove("hidden");
  goToStep(step);
}
$("doneBtn").onclick=()=>showStepAfterResult(1);
$("retryBtn").onclick=()=>{showStepAfterResult(3);simulatePayment();};

renderResults();
renderSelected();
updateProgress();
