document.addEventListener('DOMContentLoaded', () => {
    loadProductDirectory();
    loadMealsFromLocalStorage();
    updateAllTotals();  // Обновляем общие калории и углеводы при загрузке
});

document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const calories = parseInt(document.getElementById('calories').value);
    const carbs = parseInt(document.getElementById('carbs').value);

    addProductToDirectory(name, calories, carbs);
    saveProductToDirectory(name, calories, carbs);
    updateProductSelect();

    document.getElementById('productForm').reset();
});

document.getElementById('addToMealBtn').addEventListener('click', function() {
    const mealTime = document.getElementById('mealTime').value;
    const productSelect = document.getElementById('productSelect');
    const selectedProduct = productSelect.options[productSelect.selectedIndex].value;

    if (selectedProduct) {
        const [name, calories, carbs] = selectedProduct.split('|');
        addProductToMeal(name, parseInt(calories), parseInt(carbs), mealTime);
        saveProductToMeal(name, parseInt(calories), parseInt(carbs), mealTime);
        updateMealTotals(mealTime);  // Обновляем общие калории и углеводы
    }
});

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
        updateProductSelect();
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
    updateProductSelect();
}

function updateProductSelect() {
    const productSelect = document.getElementById('productSelect');
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
        updateMealTotals(mealTime);  // Обновляем общие калории и углеводы после удаления
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
    updateAllTotals();  // Обновляем общие калории и углеводы для всех приёмов пищи
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
