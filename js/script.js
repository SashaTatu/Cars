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

            // Remove focus from the dropdown
            yearDropdown.blur();

            const prevButton = document.getElementById('prev');
            const nextButton = document.getElementById('next');

            // Hide buttons by default
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';

            if (
                selectedMake &&
                selectedBrand &&
                selectedYear &&
                structuredData[selectedMake][selectedBrand][selectedYear]
            ) {
                const images = structuredData[selectedMake][selectedBrand][selectedYear];
                const sliderContainer = document.getElementById('slider-container');
                sliderContainer.innerHTML = ''; // Clear previous images

                // Add only valid images to the slider
                images.forEach(({ path, src }) => {
                    const img = new Image(); // Create a new Image object
                    img.src = src;

                    // Check if the image loads successfully
                    img.onload = () => {
                        if (img.naturalWidth > 1 && img.naturalHeight > 1) {
                            const galleryImg = document.createElement('img');
                            galleryImg.src = src;
                            galleryImg.alt = `${path}`;
                            galleryImg.classList.add('slider-image');

                            // Add click event to open modal
                            galleryImg.addEventListener('click', () => {
                                modal.style.display = 'block';
                                modalImg.src = src;
                                modalCaption.textContent = `${path}`;
                            });

                            sliderContainer.appendChild(galleryImg);
                        }
                    };

                    // Handle image load error
                    img.onerror = () => {
                        console.warn(`Image not found or invalid: ${src}`);
                    };
                });

                // Show buttons if images are available
                if (images.length > 0) {
                    prevButton.style.display = 'flex';
                    nextButton.style.display = 'flex';
                }

                // Initialize slider functionality
                let currentIndex = 0;
                const imagesPerPage = 6;

                const updateSlider = () => {
                    const offset = -currentIndex * 100; // Move slider by 100% for each page
                    sliderContainer.style.transform = `translateX(${offset}%)`;
                };

                prevButton.addEventListener('click', () => {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateSlider();
                    }
                });

                nextButton.addEventListener('click', () => {
                    if (currentIndex < Math.ceil(images.length / imagesPerPage) - 1) {
                        currentIndex++;
                        updateSlider();
                    }
                });

                // Add keyboard navigation
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'ArrowLeft') {
                        // Simulate "Prev" button click
                        if (currentIndex > 0) {
                            currentIndex--;
                            updateSlider();
                        }
                    } else if (event.key === 'ArrowRight') {
                        // Simulate "Next" button click
                        if (currentIndex < Math.ceil(images.length / imagesPerPage) - 1) {
                            currentIndex++;
                            updateSlider();
                        }
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