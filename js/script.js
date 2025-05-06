// This file contains the JavaScript code for the web application.

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

                let currentIndex = 0;

                // Function to update the displayed image
                const updateImage = () => {
                    sliderContainer.innerHTML = ''; // Clear the container
                    const img = new Image();
                    img.src = images[currentIndex].src;
                    img.alt = images[currentIndex].path;
                    img.classList.add('slider-image');

                    // Handle image load error
                    img.onerror = () => {
                        sliderContainer.innerHTML = ''; // Clear the container
                        const errorDiv = document.createElement('div');
                        errorDiv.textContent = 'Ой, фото не вдалося завантажити';
                        errorDiv.classList.add('image-error');
                        sliderContainer.appendChild(errorDiv);
                    };

                    // Check image dimensions after it loads
                    img.onload = () => {
                        if (img.naturalWidth === 1 && img.naturalHeight === 1) {
                            // Do not display images with dimensions 1x1
                            sliderContainer.style.display='none' // Clear the container
                        } else {
                            sliderContainer.appendChild(img);
                        }
                    };

                    sliderContainer.appendChild(img);
                };

                // Initialize the first image
                updateImage();

                // Add event listeners for navigation buttons
                document.getElementById('prev').addEventListener('click', () => {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateImage();
                    }
                });

                document.getElementById('next').addEventListener('click', () => {
                    if (currentIndex < images.length - 1) {
                        currentIndex++;
                        updateImage();
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