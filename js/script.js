// This file contains the JavaScript code for the web application.

// Fetch data from cars.json
fetch('js/cars.json')
    .then(response => response.json())
    .then(data => {
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

                // Populate brand dropdown (sorted alphabetically)
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
            gallery.innerHTML = '';
            const selectedMake = makeDropdown.value;
            const selectedBrand = brandDropdown.value;
            const selectedYear = yearDropdown.value;

            if (
                selectedMake &&
                selectedBrand &&
                selectedYear &&
                structuredData[selectedMake][selectedBrand][selectedYear]
            ) {
                const images = structuredData[selectedMake][selectedBrand][selectedYear];
                const sliderContainer = document.getElementById('slider-container');
                sliderContainer.innerHTML = ''; // Clear previous images

                // Add only the first 6 images to the slider
                images.slice(0, 6).forEach(({ path, src }) => {
                    const img = new Image();
                    img.src = src;
                    img.alt = `${path}`;
                    img.onload = () => {
                        if (img.width > 1 && img.height > 1) {
                            sliderContainer.appendChild(img);
                        }
                    };
                    img.onerror = () => {
                        console.warn(`Image not found or invalid: ${src}`);
                    };
                });

                // Initialize slider functionality
                let currentIndex = 0;
                const imagesPerPage = 6;

                const updateSlider = () => {
                    const offset = -currentIndex * 100; // Переміщення на 100% для кожної сторінки
                    sliderContainer.style.transform = `translateX(${offset}%)`;
                };

                document.getElementById('prev').addEventListener('click', () => {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateSlider();
                    }
                });

                document.getElementById('next').addEventListener('click', () => {
                    if (currentIndex < Math.ceil(images.length / imagesPerPage) - 1) {
                        currentIndex++;
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
    })
    .catch((error) => console.error('Error loading cars.json:', error));