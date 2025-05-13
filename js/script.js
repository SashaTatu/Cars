// This file contains the JavaScript code for the web application.

const loader = document.getElementById('loader');
const dots = document.getElementById('dots');

let dotCount = 0;

// Функція для оновлення крапок
const animateDots = () => {
    dotCount = (dotCount + 1) % 4;

    // Зміна тексту і поява
    setTimeout(() => {
        dots.textContent = '.'.repeat(dotCount);
        dots.style.opacity = 1;
    }, 100); 
};

const dotsInterval = setInterval(animateDots, 70);

// Приклад: Приховати завантажувач після завершення завантаження
setTimeout(() => {
    clearInterval(dotsInterval); // Зупиняємо анімацію
    loader.classList.add('hidden'); // Приховуємо завантажувач
}, 5000); // Приховати через 5 секунд


// Fetch data from cars.json
fetch('js/cars.json')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Перевірте, чи дані завантажуються правильно
        const makeDropdown = document.getElementById('make');
        const brandDropdown = document.getElementById('brand');
        const yearDropdown = document.getElementById('year');
        const gallery = document.getElementById('gallery');
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modal-img');
        const modalPath = document.getElementById('modal-path');
        const closeModal = document.getElementById('close');

        // Parse data into a structured format
        const structuredData = {};
        for (const key of Object.keys(data)) {
            const [make, brand, year] = key.split('/');
            if (!structuredData[make]) structuredData[make] = {};
            if (!structuredData[make][brand]) structuredData[make][brand] = {};
            if (!structuredData[make][brand][year]) structuredData[make][brand][year] = [];
            structuredData[make][brand][year].push({ path: key, src: data[key] });
        }

        // Populate make dropdown (sorted alphabetically)
        const makes = Object.keys(structuredData).sort();
        for (const make of makes) {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            makeDropdown.appendChild(option);
        }

        // Handle make selection
        makeDropdown.addEventListener('change', () => {
            brandDropdown.innerHTML = '<option value="">Виберіть модель</option>';
            yearDropdown.innerHTML = '<option value="">Виберіть рік</option>';
            gallery.innerHTML = '';
            brandDropdown.disabled = true;
            yearDropdown.disabled = true;

            const selectedMake = makeDropdown.value;
            if (selectedMake && structuredData[selectedMake]) {
                brandDropdown.disabled = false;

                // Populate brand dropdown
                const brands = Object.keys(structuredData[selectedMake]).sort();
                for (const brand of brands) {
                    const option = document.createElement('option');
                    option.value = brand;
                    option.textContent = brand;
                    brandDropdown.appendChild(option);
                }
            }
        });

        // Handle brand selection
        brandDropdown.addEventListener('change', () => {
            yearDropdown.innerHTML = '<option value="">Виберіть рік</option>';
            gallery.innerHTML = '';
            yearDropdown.disabled = true;

            const selectedMake = makeDropdown.value;
            const selectedBrand = brandDropdown.value;
            if (selectedMake && selectedBrand && structuredData[selectedMake][selectedBrand]) {
                yearDropdown.disabled = false;

                // Populate year dropdown (sorted numerically)
                const years = Object.keys(structuredData[selectedMake][selectedBrand])
                    .map(Number) // Convert to numbers for sorting
                    .sort((a, b) => a - b); // Sort in ascending order
                for (const year of years) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearDropdown.appendChild(option);
                }
            }
        });

        // Handle year selection
        yearDropdown.addEventListener('change', () => {
            const selectedMake = makeDropdown.value;
            const selectedBrand = brandDropdown.value;
            const selectedYear = yearDropdown.value;

            // Remove focus from the dropdown
            yearDropdown.blur();

            const sliderContainer = document.getElementById('slider-container');
            sliderContainer.innerHTML = ''; // Clear previous images

            if (
                selectedMake &&
                selectedBrand &&
                selectedYear &&
                structuredData[selectedMake][selectedBrand][selectedYear]
            ) {
                const images = structuredData[selectedMake][selectedBrand][selectedYear];
                let currentIndex = 0;

                // Add images to the slider
                images.forEach(({ path, src }, index) => {
                    const img = new Image();
                    img.src = src;
                    img.alt = `${path}`;
                    img.classList.add('slider-image');

                    // Handle image load success
                    img.onload = () => {
                        if (index === currentIndex) img.classList.add('active', 'visible'); // Set the first image as active
                        else if (index === currentIndex - 1 || index === currentIndex + 1) {
                            img.classList.add('side', 'visible'); // Set side images
                        }
                        sliderContainer.appendChild(img);
                    };

                    // Handle image load error
                    img.onerror = () => {
                        console.warn(`Image failed to load: ${src}`);
                    };
                });

                const updateSlider = () => {
                    const allImages = sliderContainer.querySelectorAll('.slider-image');
                    allImages.forEach((img, index) => {
                        img.classList.remove('active', 'side', 'visible');
                        if (index === currentIndex) {
                            img.classList.add('active', 'visible');
                        } else if (index === currentIndex - 1 || index === currentIndex + 1) {
                            img.classList.add('side', 'visible');
                        }
                    });
                };

                // Add navigation buttons
                const prevButton = document.getElementById('prev');
                const nextButton = document.getElementById('next');

                prevButton.addEventListener('click', () => {
                    currentIndex = (currentIndex - 1 + images.length) % images.length; // Move to the previous image
                    updateSlider();
                });

                nextButton.addEventListener('click', () => {
                    currentIndex = (currentIndex + 1) % images.length; // Move to the next image
                    updateSlider();
                });

                // Add keyboard navigation
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'ArrowLeft') {
                        // Simulate "Prev" button click
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                        updateSlider();
                    } else if (event.key === 'ArrowRight') {
                        // Simulate "Next" button click
                        currentIndex = (currentIndex + 1) % images.length;
                        updateSlider();
                    }
                });
            }
        });

        // Close modal
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal on outside click
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Приховати завантажувач після завантаження
        loader.classList.add('hidden');
    })
    .catch((error) => {
        console.error('Error loading cars.json:', error);

        // Приховати завантажувач навіть у разі помилки
        loader.classList.add('hidden');
    });

