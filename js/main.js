document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');
    let calendarInitialized = false;

    function showSection(sectionId) {
        // Ocultar todas las secciones
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar solo la sección seleccionada
        const selectedSection = document.getElementById(sectionId);
        selectedSection.style.display = 'block';

        // Actualizar clases active en la navegación
        navItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    // Event listeners para los enlaces de navegación
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const pageId = event.currentTarget.getAttribute('data-page');
            showSection(pageId + 'Content');
            event.currentTarget.classList.add('active');

            if (pageId === 'calendar' && !calendarInitialized) {
                $('#calendar').fullCalendar({
                    header: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay'
                    },
                    events: function(start, end, timezone, callback) {
                        const crops = JSON.parse(localStorage.getItem('crops') || '[]');
                        const events = [];
                        
                        crops.forEach(crop => {
                            // Evento de inicio
                            events.push({
                                title: `Inicio: ${crop.name}`,
                                start: crop.createdAt,
                                color: '#4CAF50',
                                textColor: '#fff'
                            });
                            
                            // Evento de cosecha
                            events.push({
                                title: `Cosecha: ${crop.name}`,
                                start: crop.harvestDate,
                                color: '#FFA500',
                                textColor: '#fff'
                            });
                        });
                        
                        callback(events);
                    },
                    eventClick: function(event) {
                        if (event.description) {
                            alert(`${event.title}\nNotas: ${event.description}`);
                        } else {
                            alert(`Evento: ${event.title}`);
                        }
                    },
                    eventRender: function(event, element) {
                        if (event.description) {
                            element.find('.fc-title').after(`<div class="event-notes">${event.description}</div>`);
                        }
                    },
                    editable: false,
                    eventLimit: true
                });
                calendarInitialized = true;
            }
        });
    });

    // Mostrar la sección de inicio por defecto
    showSection('homeContent');
    
    // Manejo del formulario de perfil
    document.getElementById('profileForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener los valores del formulario
        const formData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            finca: document.getElementById('finca').value
        };

        // Aquí puedes agregar la lógica para guardar los datos
        // Por ejemplo, enviarlos a un servidor o guardarlos en localStorage
        localStorage.setItem('userProfile', JSON.stringify(formData));
        
        alert('Cambios guardados exitosamente');
    });

    // Cargar datos del perfil si existen
    function loadProfileData() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            document.getElementById('nombre').value = profile.nombre || '';
            document.getElementById('apellido').value = profile.apellido || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('telefono').value = profile.telefono || '';
            document.getElementById('finca').value = profile.finca || '';
        }
    }

    // Cargar datos cuando se muestre la sección de perfil
    document.querySelector('[data-page="profile"]').addEventListener('click', loadProfileData);

    // Consejos de cultivo
    const consejosCultivo = {
        maiz: [
            "Mantén el suelo húmedo pero no encharcado",
            "Aplica fertilizante rico en nitrógeno",
            "Controla las malezas durante las primeras semanas"
        ],
        frijol: [
            "Siembra cuando el suelo esté caliente",
            "Evita el exceso de nitrógeno",
            "Mantén el cultivo libre de malezas"
        ],
        tomate: [
            "Proporciona soporte a las plantas",
            "Poda los brotes laterales",
            "Riega regularmente pero evita mojar las hojas"
        ],
        papa: [
            "Aporcar las plantas regularmente",
            "Mantener el suelo húmedo uniformente",
            "Vigilar signos de tizón tardío"
        ],
        zanahoria: [
            "Mantén el suelo suelto y bien drenado",
            "Evita el exceso de nitrógeno",
            "Riega frecuentemente pero con poca cantidad"
        ],
        arroz: ["Mantén el nivel de agua adecuado", "Control de malezas es crucial", "Monitorea plagas como el gorgojo"],
        sorgo: ["Resistente a la sequía", "Necesita suelos bien drenados", "Controlar pájaros en la etapa de maduración"],
        trigo: ["Requiere clima fresco", "Riego moderado", "Control de roya y fusarium"],
        arveja: ["Suelos bien drenados", "Soporte para plantas", "Rotación de cultivos"],
        soya: ["Control de malezas temprano", "Inoculación de semillas", "Monitoreo de plagas"]
    };

    const planificationsManager = {
        planifications: JSON.parse(localStorage.getItem('planifications') || '[]'),

        addPlanification(formData) {
            const planification = {
                id: Date.now(),
                ...formData,
                estado: 'pendiente'
            };
            this.planifications.push(planification);
            this.savePlanifications();
            this.renderPlanifications();

            // Calcular fecha de cosecha
            const fechaSiembra = new Date(formData.fechaSiembra);
            const fechaCosecha = new Date(fechaSiembra);
            fechaCosecha.setDate(fechaCosecha.getDate() + parseInt(formData.diasCosecha));

            // Mostrar consejo
            const consejos = consejosCultivo[formData.cultivo];
            const consejoAleatorio = consejos[Math.floor(Math.random() * consejos.length)];
            const consejoBox = document.getElementById('consejoSiembra');
            consejoBox.innerHTML = `
                <h4>Consejo para tu cultivo:</h4>
                <p>${consejoAleatorio}</p>
                <p>Fecha estimada de cosecha: ${fechaCosecha.toLocaleDateString()}</p>
            `;
            consejoBox.classList.remove('hidden');

            // Agregar eventos al calendario
            if (calendarInitialized) {
                $('#calendar').fullCalendar('renderEvent', {
                    title: `Planificación: ${formData.cultivo}`,
                    start: formData.fechaSiembra,
                    color: '#4CAF50'
                }, true);

                $('#calendar').fullCalendar('renderEvent', {
                    title: `Cosecha Planificada: ${formData.cultivo}`,
                    start: fechaCosecha.toISOString(),
                    color: '#FFA500'
                }, true);
            }
        },

        savePlanifications() {
            localStorage.setItem('planifications', JSON.stringify(this.planifications));
        },

        deletePlanification(id) {
            this.planifications = this.planifications.filter(plan => plan.id !== id);
            this.savePlanifications();
            this.renderPlanifications();
        },

        startCrop(planification) {
            const fechaSiembra = new Date(planification.fechaSiembra);
            const fechaCosecha = new Date(fechaSiembra);
            fechaCosecha.setDate(fechaSiembra.getDate() + parseInt(planification.diasCosecha));

            // Crear nuevo cultivo
            const newCrop = {
                name: planification.cultivo,
                type: planification.terreno,
                growthCycle: parseInt(planification.diasCosecha),
                waterNeeds: planification.riego,
                createdAt: planification.fechaSiembra,
                harvestDate: fechaCosecha.toISOString(),
                area: planification.area
            };

            // Agregar el cultivo usando el cropsManager
            cropsManager.addCrop(newCrop);

            // Eliminar eventos de planificación del calendario
            if (calendarInitialized) {
                $('#calendar').fullCalendar('removeEvents', event => 
                    event.title.includes(`Planificación: ${planification.cultivo}`) ||
                    event.title.includes(`Cosecha Planificada: ${planification.cultivo}`)
                );

                // Agregar nuevos eventos de cultivo activo
                $('#calendar').fullCalendar('renderEvent', {
                    title: `Siembra: ${planification.cultivo}`,
                    start: fechaSiembra.toISOString(),
                    color: '#4CAF50',
                    textColor: '#fff'
                }, true);

                $('#calendar').fullCalendar('renderEvent', {
                    title: `Cosecha: ${planification.cultivo}`,
                    start: fechaCosecha.toISOString(),
                    color: '#FFA500',
                    textColor: '#fff'
                }, true);
            }

            // Eliminar la planificación del historial
            this.deletePlanification(planification.id);
        },

        renderPlanifications() {
            const planificationsGrid = document.querySelector('.planifications-grid');
            if (!planificationsGrid) return;

            planificationsGrid.innerHTML = '';

            this.planifications.forEach(plan => {
                const card = document.createElement('div');
                card.className = 'planification-card';
                card.innerHTML = `
                    <h4>${plan.cultivo}</h4>
                    <p><strong>Terreno:</strong> ${plan.terreno}</p>
                    <p><strong>Área:</strong> ${plan.area}m²</p>
                    <p><strong>Fecha planificada:</strong> ${new Date(plan.fechaSiembra).toLocaleDateString()}</p>
                    <p><strong>Días hasta cosecha:</strong> ${plan.diasCosecha}</p>
                    <p><strong>Sistema de riego:</strong> ${plan.riego}</p>
                    <div class="planification-actions">
                        <button class="btn btn-start-crop" data-id="${plan.id}">
                            Iniciar Cultivo
                        </button>
                        <button class="btn btn-delete-plan" data-id="${plan.id}">
                            Eliminar
                        </button>
                    </div>
                `;

                const startBtn = card.querySelector('.btn-start-crop');
                startBtn.addEventListener('click', () => {
                    if (confirm('¿Deseas iniciar este cultivo?')) {
                        this.startCrop(plan);
                    }
                });

                const deleteBtn = card.querySelector('.btn-delete-plan');
                deleteBtn.addEventListener('click', () => {
                    if (confirm('¿Estás seguro de eliminar esta planificación?')) {
                        this.deletePlanification(plan.id);
                    }
                });

                planificationsGrid.appendChild(card);
            });
        }
    };

    // Manejo del formulario de planificación de siembra
    document.getElementById('planSowingForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            cultivo: document.getElementById('cultivo').value,
            terreno: document.getElementById('terreno').value,
            fechaSiembra: document.getElementById('fechaSiembra').value,
            area: document.getElementById('area').value,
            riego: document.getElementById('riego').value,
            notas: document.getElementById('notas').value,
            diasCosecha: document.getElementById('diasCosecha').value
        };

        // Usar el planificationsManager para agregar la planificación
        planificationsManager.addPlanification(formData);
        
        // Limpiar formulario
        this.reset();
        
        // Mostrar mensaje de éxito
        alert('Planificación guardada exitosamente');
    });

    // Cargar planificaciones cuando se muestre la sección
    document.querySelector('[data-page="plan-sowing"]').addEventListener('click', () => {
        planificationsManager.renderPlanifications();
    });

    // Gestión de cultivos
    const cropsManager = {
        crops: JSON.parse(localStorage.getItem('crops') || '[]'),

        addCrop(crop) {
            crop.id = Date.now();
            crop.createdAt = new Date().toISOString();
            crop.progress = 0;
            
            // Calcular fecha de finalización
            const fechaInicio = new Date(crop.createdAt);
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + parseInt(crop.growthCycle));
            crop.harvestDate = fechaFin.toISOString();

            this.crops.push(crop);
            this.saveCrops();
            this.renderCrops();

            // Agregar eventos al calendario
            if (calendarInitialized) {
                // Evento de inicio del cultivo
                $('#calendar').fullCalendar('renderEvent', {
                    title: `Inicio: ${crop.name}`,
                    start: crop.createdAt,
                    color: '#4CAF50',
                    textColor: '#fff'
                }, true);

                // Evento de cosecha
                $('#calendar').fullCalendar('renderEvent', {
                    title: `Cosecha: ${crop.name}`,
                    start: crop.harvestDate,
                    color: '#FFA500',
                    textColor: '#fff'
                }, true);
            }
        },

        saveCrops() {
            localStorage.setItem('crops', JSON.stringify(this.crops));
        },

        calculateProgress(crop) {
            const startDate = new Date(crop.createdAt);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
            return Math.min(100, Math.round((daysPassed / crop.growthCycle) * 100));
        },

        deleteCrop(cropId) {
            // Obtener el cultivo antes de eliminarlo
            const cropToDelete = this.crops.find(crop => crop.id === cropId);
            
            this.crops = this.crops.filter(crop => crop.id !== cropId);
            this.saveCrops();
            this.renderCrops();

            // Eliminar eventos del calendario
            if (calendarInitialized && cropToDelete) {
                $('#calendar').fullCalendar('removeEvents', event => 
                    event.title.includes(cropToDelete.name)
                );
            }
        },

        addEventToCrop(cropId, eventData) {
            const crop = this.crops.find(c => c.id === cropId);
            if (crop) {
                if (!crop.events) crop.events = [];
                eventData.id = Date.now();
                crop.events.push(eventData);
                this.saveCrops();
                this.renderCrops();

                // Mejorar la visualización del evento en el calendario
                if (calendarInitialized) {
                    const eventColors = {
                        fertilizacion: '#8bc34a', // Verde claro
                        riego: '#03a9f4',         // Azul
                        fumigacion: '#ff9800',    // Naranja
                        poda: '#9c27b0',          // Morado
                        control_plagas: '#f44336', // Rojo
                        otro: '#795548'           // Marrón
                    };

                    const eventTitle = {
                        fertilizacion: '🌱 Fertilización',
                        riego: '💧 Riego',
                        fumigacion: '🌫️ Fumigación',
                        poda: '✂️ Poda',
                        control_plagas: '🐛 Control de Plagas',
                        otro: '📝 Otro'
                    };

                    $('#calendar').fullCalendar('renderEvent', {
                        title: `${eventTitle[eventData.type]} - ${crop.name}`,
                        start: eventData.date,
                        color: eventColors[eventData.type],
                        textColor: '#fff',
                        description: eventData.notes,
                    }, true);
                }
            }
        },

        renderCrops() {
            const cropsGrid = document.querySelector('.crops-grid');
            cropsGrid.innerHTML = '';

            this.crops.forEach(crop => {
                const progress = this.calculateProgress(crop);
                const card = document.createElement('div');
                card.className = 'crop-card';
                
                // Crear lista de eventos del cultivo
                const eventsHtml = (crop.events || []).map(event => `
                    <li class="crop-event">
                        <span class="event-type">${event.type}</span>
                        <span class="event-date">${new Date(event.date).toLocaleDateString()}</span>
                        <span class="event-notes">${event.notes}</span>
                    </li>
                `).join('');

                card.innerHTML = `
                    <div class="crop-header">
                        <h3 class="crop-title">${crop.name}</h3>
                        <div class="crop-actions">
                            <button class="add-event-btn" data-crop-id="${crop.id}">
                                <i class="fas fa-plus"></i> Evento
                            </button>
                            <button class="delete-crop-btn" data-crop-id="${crop.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="crop-info">
                        <p><strong>Tipo:</strong> ${crop.type}</p>
                        <p><strong>Ciclo:</strong> ${crop.growthCycle} días</p>
                        <p><strong>Necesidad de agua:</strong> ${crop.waterNeeds}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <p class="progress-text">${progress}% completado</p>
                        ${crop.events && crop.events.length > 0 ? `
                            <div class="crop-events">
                                <h4>Eventos del cultivo</h4>
                                <ul class="events-list">
                                    ${eventsHtml}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;

                // Agregar event listener para el botón de agregar evento
                const addEventBtn = card.querySelector('.add-event-btn');
                addEventBtn.addEventListener('click', () => {
                    document.getElementById('eventModal').classList.remove('hidden');
                    document.getElementById('eventCropId').value = crop.id;
                });

                cropsGrid.appendChild(card);
                
                // Agregar event listener para el botón de eliminar
                const deleteBtn = card.querySelector('.delete-crop-btn');
                deleteBtn.addEventListener('click', () => {
                    if (confirm('¿Estás seguro de que deseas eliminar este cultivo?')) {
                        this.deleteCrop(crop.id);
                    }
                });
            });
        }
    };

    // Event listeners para la gestión de cultivos
    document.getElementById('addCropBtn')?.addEventListener('click', () => {
        document.getElementById('cropModal').classList.remove('hidden');
    });

    document.getElementById('cancelCropBtn')?.addEventListener('click', () => {
        document.getElementById('cropModal').classList.add('hidden');
    });

    document.getElementById('cropForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newCrop = {
            name: document.getElementById('cropName').value,
            type: document.getElementById('cropType').value,
            growthCycle: parseInt(document.getElementById('growthCycle').value),
            waterNeeds: document.getElementById('waterNeeds').value
        };

        cropsManager.addCrop(newCrop);
        document.getElementById('cropModal').classList.add('hidden');
        document.getElementById('cropForm').reset();
    });

    // Event listeners para el modal de eventos
    document.getElementById('eventForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const cropId = parseInt(document.getElementById('eventCropId').value);
        const eventData = {
            type: document.getElementById('eventType').value,
            notes: document.getElementById('eventNotes').value,
            date: document.getElementById('eventDate').value // Obtener la fecha seleccionada
        };

        cropsManager.addEventToCrop(cropId, eventData);
        document.getElementById('eventModal').classList.add('hidden');
        document.getElementById('eventForm').reset();
    });

    document.getElementById('cancelEventBtn')?.addEventListener('click', () => {
        document.getElementById('eventModal').classList.add('hidden');
    });

    // Actualizar el progreso de los cultivos cada minuto
    setInterval(() => {
        if (document.getElementById('cropsContent').style.display === 'block') {
            cropsManager.renderCrops();
        }
    }, 60000);

    // Cargar cultivos cuando se muestre la sección
    document.querySelector('[data-page="crops"]').addEventListener('click', () => {
        cropsManager.renderCrops();
    });

    // Productos de la tienda
    const storeProducts = [
        { id: 1, name: 'Fertilizante Orgánico', price: 57000, image: '../img/fertilizante.png' },
        { id: 2, name: 'Pala', price: 35000, image: '../img/pala.png' },
        { id: 3, name: 'Semillas de Tomate', price: 12000, image: '../img/semillas-tomate.png' },
        { id: 4, name: 'Insecticida', price: 26000, image: '../img/insecticida.jpeg' },
        // Agrega más productos según sea necesario
    ];

    const cartManager = {
        items: [],

        init() {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
                this.updateCartCount();
            }

            document.querySelector('.cart-icon')?.addEventListener('click', () => this.openCart());
            document.querySelector('.close-cart')?.addEventListener('click', () => this.closeCart());
            document.querySelector('.cart-backdrop')?.addEventListener('click', () => this.closeCart());
            document.querySelector('.checkout-btn')?.addEventListener('click', () => this.checkout());
        },

        addItem(productId) {
            const product = storeProducts.find(p => p.id === productId);
            if (!product) return;

            const existingItem = this.items.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({
                    ...product,
                    quantity: 1
                });
            }

            this.updateCart();
            this.showAddedToCartMessage(product.name);
        },

        removeItem(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.updateCart();
        },

        updateQuantity(productId, change) {
            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    this.updateCart();
                }
            }
        },

        updateCart() {
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCartCount();
            this.renderCartItems();
            this.updateTotal();
        },

        updateCartCount() {
            const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelector('.cart-count').textContent = count;
        },

        renderCartItems() {
            const cartItems = document.querySelector('.cart-items');
            const emptyMessage = document.querySelector('.cart-empty-message');
            const cartFooter = document.querySelector('.cart-footer');
            
            if (this.items.length === 0) {
                cartItems.innerHTML = '';
                emptyMessage.style.display = 'block';
                cartFooter.style.display = 'none';
                return;
            }
        
            emptyMessage.style.display = 'none';
            cartFooter.style.display = 'block';
            
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" onclick="cartManager.updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="cartManager.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <i class="fas fa-trash remove-item" onclick="cartManager.removeItem(${item.id})"></i>
                </div>
            `).join('');
        },

        updateTotal() {
            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.querySelector('.cart-total span:last-child').textContent = `$${total.toFixed(2)}`;
        },

        openCart() {
            document.querySelector('.cart-modal').style.display = 'block';
            document.querySelector('.cart-backdrop').style.display = 'block';
        },

        closeCart() {
            document.querySelector('.cart-modal').style.display = 'none';
            document.querySelector('.cart-backdrop').style.display = 'none';
        },

        showAddedToCartMessage(productName) {
            const message = document.createElement('div');
            message.className = 'cart-notification';
            message.innerHTML = `¡${productName} agregado al carrito!`;
            document.body.appendChild(message);

            // Eliminar la notificación después de 2 segundos
            setTimeout(() => {
                message.remove();
            }, 2000);
        },

        checkout() {
            if (this.items.length === 0) {
                alert('El carrito está vacío');
                return;
            }
            
            const paymentModal = document.querySelector('.payment-modal');
            const itemsList = paymentModal.querySelector('.items-list');
            const totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Mostrar productos en el resumen
            itemsList.innerHTML = this.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="order-item-details">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-price">$${item.price}</div>
                        <div class="order-item-quantity">Cantidad: ${item.quantity}</div>
                    </div>
                </div>
            `).join('');

            // Actualizar total
            document.querySelectorAll('.total-amount').forEach(el => {
                el.textContent = `$${totalAmount.toFixed(2)}`;
            });
            
            paymentModal.classList.remove('hidden');
            
            // Manejar el envío del formulario de pago
            const paymentForm = document.getElementById('paymentForm');
            
            const handlePaymentSubmit = async (e) => {
                e.preventDefault();
                
                // Obtener el método de pago seleccionado
                const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
                
                // Validar campos según el método de pago
                const currentForm = document.getElementById(`${selectedMethod}Form`);
                const requiredInputs = currentForm.querySelectorAll('input[required], select[required]');
                let isValid = true;
                
                requiredInputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });
                
                if (!isValid) {
                    alert('Por favor complete todos los campos requeridos');
                    return;
                }
                
                // Mostrar estado de procesamiento
                const submitBtn = e.target.querySelector('.payment-submit-btn');
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                submitBtn.disabled = true;
                
                try {
                    // Simular proceso de pago
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Limpiar carrito
                    this.items = [];
                    this.updateCart();
                    this.closeCart();
                    
                    // Cerrar modal de pago
                    paymentModal.classList.add('hidden');
                    
                    // Mostrar mensaje de éxito
                    alert('¡Pago procesado exitosamente! Gracias por tu compra.');
                    
                    // Resetear formulario
                    paymentForm.reset();
                    
                } catch (error) {
                    alert('Error al procesar el pago. Por favor intente nuevamente.');
                } finally {
                    // Restaurar botón
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            };
            
            // Remover evento anterior si existe
            paymentForm.removeEventListener('submit', handlePaymentSubmit);
            // Agregar nuevo evento
            paymentForm.addEventListener('submit', handlePaymentSubmit);
        }
    };

    // Hacer cartManager accesible globalmente
    window.cartManager = cartManager;

    function renderStoreProducts() {
        const storeContainer = document.querySelector('.store-container');
        if (!storeContainer) return;

        storeContainer.innerHTML = '';

        storeProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
                <button class="btn btn-primary add-to-cart-btn" onclick="window.cartManager.addItem(${product.id})">
                    Agregar al Carrito
                </button>
            `;
            storeContainer.appendChild(productCard);
        });
    }

    // Cargar productos cuando se muestre la sección de tienda
    document.querySelector('[data-page="store"]').addEventListener('click', renderStoreProducts);

    // Inicializar el carrito cuando se carga la página
    cartManager.init();

    // Manejo del botón de cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Manejo de cambio de método de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Ocultar todos los formularios
            document.querySelectorAll('.payment-method-form').forEach(form => {
                form.classList.add('hidden');
            });
            
            // Mostrar el formulario correspondiente
            const selectedMethod = e.target.value;
            document.getElementById(`${selectedMethod}Form`).classList.remove('hidden');
            
            // Actualizar los campos requeridos
            const currentForm = document.getElementById(`${selectedMethod}Form`);
            currentForm.querySelectorAll('input, select').forEach(input => {
                input.required = true;
            });
            
            // Remover required de los otros formularios
            document.querySelectorAll('.payment-method-form:not(#${selectedMethod}Form)').forEach(form => {
                form.querySelectorAll('input, select').forEach(input => {
                    input.required = false;
                });
            });
        });
    });
}); // Final del DOMContentLoaded