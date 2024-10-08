document.addEventListener('DOMContentLoaded', () => {
    loadProductDirectory();
    loadMealsFromLocalStorage();
    updateAllTotals();
});

document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const calories = parseInt(document.getElementById('calories').value);
    const carbs = parseInt(document.getElementById('carbs').value);

    addProductToDirectory(name, calories, carbs);
    saveProductToDirectory(name, calories, carbs);
    updateAllProductSelects();

    document.getElementById('productForm').reset();
});

document.addEventListener('DOMContentLoaded', () => {
    loadProductDirectory();
    loadMealsFromLocalStorage();
    updateAllTotals();

    // Обработчик для селектора
    document.getElementById('toggleProductForm').addEventListener('change', function() {
        const productFormContainer = document.getElementById('productFormContainer');
        if (this.value === 'show') {
            productFormContainer.style.display = 'block';
        } else {
            productFormContainer.style.display = 'none';
        }
    });
});

// Кнопки добавления продуктов в разные приёмы пищи
document.getElementById('addToBreakfastBtn').addEventListener('click', () => addToMeal('breakfast'));
document.getElementById('addToLunchBtn').addEventListener('click', () => addToMeal('lunch'));
document.getElementById('addToDinnerBtn').addEventListener('click', () => addToMeal('dinner'));
document.getElementById('addToSnackBtn').addEventListener('click', () => addToMeal('snack'));

function addToMeal(mealTime) {
    const productSelect = document.getElementById(`${mealTime}Select`);
    const selectedProduct = productSelect.value;

    if (selectedProduct) {
        const [name, calories, carbs] = selectedProduct.split('|');
        addProductToMeal(name, parseInt(calories), parseInt(carbs), mealTime);
        saveProductToMeal(name, parseInt(calories), parseInt(carbs), mealTime);
        updateMealTotals(mealTime);
    }
}

function addProductToDirectory(name, calories, carbs) {
    const table = document.getElementById('productDirectoryTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${calories}</td>
        <td>${carbs}</td>
        <td><button class="delete-btn">Удалить</button></td>
    `;

    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        table.deleteRow(newRow.rowIndex - 1);
        removeProductFromDirectory(name, calories, carbs);
        updateAllProductSelects();
    });
}

function saveProductToDirectory(name, calories, carbs) {
    let products = JSON.parse(localStorage.getItem('productDirectory')) || [];
    products.push({ name, calories, carbs });
    localStorage.setItem('productDirectory', JSON.stringify(products));
}

function loadProductDirectory() {
    const products = JSON.parse(localStorage.getItem('productDirectory')) || [];
    products.forEach(product => {
        addProductToDirectory(product.name, product.calories, product.carbs);
    });
    updateAllProductSelects();
}

function updateAllProductSelects() {
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(updateProductSelect);
}

function updateProductSelect(mealTime) {
    const productSelect = document.getElementById(`${mealTime}Select`);
    productSelect.innerHTML = `<option value="" disabled selected>Выберите продукт</option>`;
    const products = JSON.parse(localStorage.getItem('productDirectory')) || [];

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = `${product.name}|${product.calories}|${product.carbs}`;
        option.textContent = `${product.name} (Калории: ${product.calories}, Углеводы: ${product.carbs} г)`;
        productSelect.appendChild(option);
    });
}

function addProductToMeal(name, calories, carbs, mealTime) {
    const table = document.getElementById(`${mealTime}Table`).getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${calories}</td>
        <td>${carbs}</td>
        <td><button class="delete-btn">Удалить</button></td>
    `;

    newRow.querySelector('.delete-btn').addEventListener('click', function() {
        table.deleteRow(newRow.rowIndex - 1);
        removeProductFromMeal(name, calories, carbs, mealTime);
        updateMealTotals(mealTime);
    });
}

function saveProductToMeal(name, calories, carbs, mealTime) {
    let meals = JSON.parse(localStorage.getItem('meals')) || {};
    if (!meals[mealTime]) {
        meals[mealTime] = [];
    }
    meals[mealTime].push({ name, calories, carbs });
    localStorage.setItem('meals', JSON.stringify(meals));
}

function loadMealsFromLocalStorage() {
    const meals = JSON.parse(localStorage.getItem('meals')) || {};
    for (const mealTime in meals) {
        meals[mealTime].forEach(product => {
            addProductToMeal(product.name, product.calories, product.carbs, mealTime);
        });
    }
    updateAllTotals();
}

function removeProductFromMeal(name, calories, carbs, mealTime) {
    let meals = JSON.parse(localStorage.getItem('meals')) || {};
    if (meals[mealTime]) {
        meals[mealTime] = meals[mealTime].filter(product => !(product.name === name && product.calories === calories && product.carbs === carbs));
        localStorage.setItem('meals', JSON.stringify(meals));
    }
}

function removeProductFromDirectory(name, calories, carbs) {
    let products = JSON.parse(localStorage.getItem('productDirectory')) || [];
    products = products.filter(product => !(product.name === name && product.calories === calories && product.carbs === carbs));
    localStorage.setItem('productDirectory', JSON.stringify(products));
}

function updateMealTotals(mealTime) {
    const table = document.getElementById(`${mealTime}Table`).getElementsByTagName('tbody')[0];
    let totalCalories = 0;
    let totalCarbs = 0;

    Array.from(table.rows).forEach(row => {
        totalCalories += parseInt(row.cells[1].textContent);
        totalCarbs += parseInt(row.cells[2].textContent);
    });

    document.getElementById(`${mealTime}Calories`).textContent = totalCalories;
    document.getElementById(`${mealTime}Carbs`).textContent = totalCarbs;
}

function updateAllTotals() {
    updateMealTotals('breakfast');
    updateMealTotals('lunch');
    updateMealTotals('dinner');
    updateMealTotals('snack');
}
