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

            // Modificar la configuración inicial del calendario para incluir los eventos de los cultivos
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
                            // Eventos de inicio y cosecha del cultivo
                            events.push({
                                id: `start_${crop.id}`,
                                title: `Inicio: ${crop.name}`,
                                start: new Date(crop.createdAt),
                                allDay: true,
                                color: '#4CAF50',
                                textColor: '#fff'
                            });
                            
                            events.push({
                                id: `harvest_${crop.id}`,
                                title: `Cosecha: ${crop.name}`,
                                start: new Date(crop.harvestDate),
                                allDay: true,
                                color: '#FFA500',
                                textColor: '#fff'
                            });

                            // Eventos adicionales del cultivo
                            if (crop.events) {
                                crop.events.forEach(event => {
                                    const eventColors = {
                                        fertilizacion: '#8bc34a',
                                        riego: '#03a9f4',
                                        fumigacion: '#ff9800',
                                        poda: '#9c27b0',
                                        control_plagas: '#f44336',
                                        otro: '#795548'
                                    };

                                    const eventTitle = {
                                        fertilizacion: '🌱 Fertilización',
                                        riego: '💧 Riego',
                                        fumigacion: '🌫️ Fumigación',
                                        poda: '✂️ Poda',
                                        control_plagas: '🐛 Control de Plagas',
                                        otro: '📝 Otro'
                                    };

                                    events.push({
                                        id: `event_${event.id}`,
                                        title: `${eventTitle[event.type]} - ${crop.name}`,
                                        start: new Date(event.date),
                                        allDay: true,
                                        color: eventColors[event.type],
                                        textColor: '#fff',
                                        description: event.notes
                                    });
                                });
                            }
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
            // Ajustar la fecha de siembra al inicio del día
            const fechaSiembra = new Date(planification.fechaSiembra);
            fechaSiembra.setHours(0, 0, 0, 0);
            
            const fechaCosecha = new Date(fechaSiembra);
            fechaCosecha.setDate(fechaSiembra.getDate() + parseInt(planification.diasCosecha));
            fechaCosecha.setHours(0, 0, 0, 0);

            // Crear nuevo cultivo
            const newCrop = {
                name: planification.cultivo,
                type: planification.terreno,
                growthCycle: parseInt(planification.diasCosecha),
                waterNeeds: planification.riego,
                createdAt: fechaSiembra.toISOString(),
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
            
            // Ajustar la fecha de inicio para que sea al inicio del día actual
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Establecer a las 00:00:00
            crop.createdAt = now.toISOString();
            crop.progress = 0;
            
            // Calcular fecha de finalización (también al inicio del día)
            const fechaFin = new Date(now);
            fechaFin.setDate(fechaFin.getDate() + parseInt(crop.growthCycle));
            fechaFin.setHours(0, 0, 0, 0);
            crop.harvestDate = fechaFin.toISOString();

            this.crops.push(crop);
            this.saveCrops();
            this.renderCrops();

            // Agregar eventos al calendario
            if (calendarInitialized) {
                $('#calendar').fullCalendar('renderEvent', {
                    title: `Inicio: ${crop.name}`,
                    start: now,
                    allDay: true,
                    color: '#4CAF50',
                    textColor: '#fff'
                }, true);

                $('#calendar').fullCalendar('renderEvent', {
                    title: `Cosecha: ${crop.name}`,
                    start: fechaFin,
                    allDay: true,
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

        calculateCropStats(crop) {
            const now = new Date();
            const stats = {
                health: 100,
                hydration: 100,
                nutrition: 100,
                lastWatering: null,
                lastFertilization: null,
                overWatering: false,
                wateringCount: 0
            };

            // Obtener eventos de riego y fertilización
            if (crop.events) {
                const wateringEvents = crop.events.filter(e => e.type === 'riego');
                const fertilizationEvents = crop.events.filter(e => e.type === 'fertilizacion');

                // Contar riegos en los últimos 7 días
                const recentWateringEvents = wateringEvents.filter(event => {
                    const eventDate = new Date(event.date);
                    const daysDiff = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                });
                stats.wateringCount = recentWateringEvents.length;
                stats.overWatering = stats.wateringCount > 3; // Más de 3 riegos en 7 días se considera excesivo

                if (wateringEvents.length > 0) {
                    stats.lastWatering = new Date(Math.max(...wateringEvents.map(e => new Date(e.date))));
                }
                if (fertilizationEvents.length > 0) {
                    stats.lastFertilization = new Date(Math.max(...fertilizationEvents.map(e => new Date(e.date))));
                }
            }

            // Calcular hidratación
            if (stats.lastWatering) {
                const daysSinceWatering = Math.floor((now - stats.lastWatering) / (1000 * 60 * 60 * 24));
                stats.hydration = Math.max(0, Math.min(100, 100 - (daysSinceWatering * 15))); // Reduce 15% por día
                
                // Penalizar la hidratación si hay exceso de riego
                if (stats.overWatering) {
                    stats.hydration = Math.max(0, stats.hydration - 20); // Penalización del 20%
                }
            } else {
                stats.hydration = 50; // Valor inicial si nunca se ha regado
            }

            // Calcular nutrición
            if (stats.lastFertilization) {
                const daysSinceFertilization = Math.floor((now - stats.lastFertilization) / (1000 * 60 * 60 * 24));
                stats.nutrition = Math.max(0, Math.min(100, 100 - (daysSinceFertilization * 10))); // Reduce 10% por día
            } else {
                stats.nutrition = 50; // Valor inicial si nunca se ha fertilizado
            }

            // Calcular salud general
            let healthBase = (stats.hydration + stats.nutrition) / 2;
            
            // Aplicar penalizaciones
            if (stats.overWatering) {
                healthBase -= 15; // Penalización por exceso de riego
            }
            if (stats.hydration < 30) {
                healthBase -= 10; // Penalización por deshidratación severa
            }
            if (stats.nutrition < 30) {
                healthBase -= 10; // Penalización por desnutrición severa
            }

            // Asegurar que la salud esté entre 0 y 100
            stats.health = Math.max(0, Math.min(100, Math.round(healthBase)));

            // Asegurar que todos los valores estén entre 0 y 100
            stats.hydration = Math.round(stats.hydration);
            stats.nutrition = Math.round(stats.nutrition);

            return stats;
        },

        deleteCrop(cropId) {
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
                
                // Crear fecha del evento y normalizarla
                const eventDate = new Date(eventData.date);
                eventDate.setHours(0, 0, 0, 0);
                
                const newEvent = {
                    id: Date.now(),
                    type: eventData.type,
                    notes: eventData.notes,
                    date: eventDate.toISOString()
                };

                crop.events.push(newEvent);
                
                // Actualizar estadísticas y guardar
                const stats = this.calculateCropStats(crop);
                crop.stats = stats;
                
                this.saveCrops();
                this.renderCrops();

                // Agregar solo el nuevo evento al calendario
                if (calendarInitialized) {
                    const eventColors = {
                        fertilizacion: '#8bc34a',
                        riego: '#03a9f4',
                        fumigacion: '#ff9800',
                        poda: '#9c27b0',
                        control_plagas: '#f44336',
                        otro: '#795548'
                    };

                    const eventTitle = {
                        fertilizacion: '🌱 Fertilización',
                        riego: '💧 Riego',
                        fumigacion: '🌫️ Fumigación',
                        poda: '✂️ Poda',
                        control_plagas: '🐛 Control de Plagas',
                        otro: '📝 Otro'
                    };

                    // Asegurarse de que la fecha del evento sea la seleccionada por el usuario
                    const calendarEvent = {
                        id: `event_${newEvent.id}`, // Identificador único para el evento
                        title: `${eventTitle[eventData.type]} - ${crop.name}`,
                        start: eventDate,
                        allDay: true,
                        color: eventColors[eventData.type],
                        textColor: '#fff',
                        description: eventData.notes
                    };

                    $('#calendar').fullCalendar('renderEvent', calendarEvent, true);
                }
            }
        },

        completeEvent(cropId, eventId) {
            const crop = this.crops.find(c => c.id === cropId);
            if (crop && crop.events) {
                const eventIndex = crop.events.findIndex(e => e.id === eventId);
                if (eventIndex !== -1) {
                    const event = crop.events[eventIndex];
                    
                    // Mantener las estadísticas actuales como base
                    const currentStats = { ...crop.stats };
                    
                    // Aplicar los efectos permanentes del evento
                    switch(event.type) {
                        case 'riego':
                            currentStats.hydration = Math.min(100, (currentStats.hydration || 0) + 40);
                            currentStats.lastWatering = new Date().toISOString();
                            break;
                        
                        case 'fertilizacion':
                            currentStats.nutrition = Math.min(100, (currentStats.nutrition || 0) + 50);
                            currentStats.lastFertilization = new Date().toISOString();
                            break;
                        
                        case 'fumigacion':
                            currentStats.pest = Math.max(0, (currentStats.pest || 100) - 70);
                            currentStats.lastFumigation = new Date().toISOString();
                            break;
                        
                        case 'control_plagas':
                            currentStats.pest = Math.max(0, (currentStats.pest || 100) - 60);
                            currentStats.disease = Math.max(0, (currentStats.disease || 100) - 40);
                            break;
                        
                        case 'poda':
                            currentStats.health = Math.min(100, (currentStats.health || 0) + 20);
                            break;
                    }

                    // Actualizar estadísticas del cultivo
                    crop.stats = currentStats;

                    // Marcar el evento como completado y moverlo al historial
                    const completedEvent = {
                        ...event,
                        completed: true,
                        completedAt: new Date().toISOString(),
                        effectsApplied: true // Marcamos que los efectos ya fueron aplicados
                    };

                    // Eliminar el evento de la lista activa y moverlo al historial
                    crop.events.splice(eventIndex, 1);
                    if (!crop.completedEvents) crop.completedEvents = [];
                    crop.completedEvents.push(completedEvent);

                    // Eliminar el evento del calendario
                    if (calendarInitialized) {
                        $('#calendar').fullCalendar('removeEvents', `event_${eventId}`);
                    }

                    // Recalcular la salud general
                    this.updateCropHealth(crop);
                    
                    this.saveCrops();
                    this.renderCrops();
                }
            }
        },

        deleteEvent(cropId, eventId) {
            const crop = this.crops.find(c => c.id === cropId);
            if (crop && crop.events) {
                const event = crop.events.find(e => e.id === eventId);
                if (event) {
                    // Solo revertir los efectos si el evento no estaba completado
                    if (!event.completed) {
                        // Revertir los efectos temporales
                        switch(event.type) {
                            case 'riego':
                                crop.stats.hydration = Math.max(0, (crop.stats.hydration || 100) - 40);
                                this.updateLastEventDate(crop, 'riego', 'lastWatering');
                                break;
                            
                            case 'fertilizacion':
                                crop.stats.nutrition = Math.max(0, (crop.stats.nutrition || 100) - 50);
                                this.updateLastEventDate(crop, 'fertilizacion', 'lastFertilization');
                                break;
                            
                            case 'fumigacion':
                                crop.stats.pest = Math.min(100, (crop.stats.pest || 0) + 70);
                                this.updateLastEventDate(crop, 'fumigacion', 'lastFumigation');
                                break;
                            
                            case 'control_plagas':
                                crop.stats.pest = Math.min(100, (crop.stats.pest || 0) + 60);
                                crop.stats.disease = Math.min(100, (crop.stats.disease || 0) + 40);
                                break;
                            
                            case 'poda':
                                crop.stats.health = Math.max(0, (crop.stats.health || 100) - 20);
                                break;
                        }
                    }

                    // Eliminar el evento
                    crop.events = crop.events.filter(e => e.id !== eventId);
                    
                    // Eliminar el evento del calendario
                    if (calendarInitialized) {
                        $('#calendar').fullCalendar('removeEvents', `event_${eventId}`);
                    }

                    // Recalcular la salud general
                    this.updateCropHealth(crop);

                    this.saveCrops();
                    this.renderCrops();
                }
            }
        },

        applyEventEffects(crop, event) {
            // Si no existe stats, inicializarlo
            if (!crop.stats) crop.stats = {};
            
            switch(event.type) {
                case 'riego':
                    crop.stats.hydration = Math.min(100, (crop.stats.hydration || 0) + 40);
                    crop.stats.lastWatering = new Date().toISOString();
                    break;
                
                case 'fertilizacion':
                    crop.stats.nutrition = Math.min(100, (crop.stats.nutrition || 0) + 50);
                    crop.stats.lastFertilization = new Date().toISOString();
                    break;
                
                case 'fumigacion':
                    crop.stats.pest = Math.max(0, (crop.stats.pest || 100) - 70);
                    crop.stats.lastFumigation = new Date().toISOString();
                    break;
                
                case 'control_plagas':
                    crop.stats.pest = Math.max(0, (crop.stats.pest || 100) - 60);
                    crop.stats.disease = Math.max(0, (crop.stats.disease || 100) - 40);
                    break;
                
                case 'poda':
                    crop.stats.health = Math.min(100, (crop.stats.health || 0) + 20);
                    break;
            }

            // Recalcular salud general después de aplicar los efectos
            this.updateCropHealth(crop);
        },

        updateCropHealth(crop) {
            const stats = crop.stats;
            let healthBase = ((stats.hydration || 0) + (stats.nutrition || 0)) / 2;
            
            // Reducir salud basado en plagas y enfermedades
            if (stats.pest) {
                healthBase -= stats.pest * 0.3;
            }
            if (stats.disease) {
                healthBase -= stats.disease * 0.3;
            }

            // Asegurar que la salud esté entre 0 y 100
            crop.stats.health = Math.max(0, Math.min(100, Math.round(healthBase)));
        },

        deleteEvent(cropId, eventId) {
            const crop = this.crops.find(c => c.id === cropId);
            if (crop && crop.events) {
                const event = crop.events.find(e => e.id === eventId);
                if (event) {
                    // Revertir los efectos del evento si no estaba completado
                    if (!event.completed) {
                        this.revertEventEffects(crop, event);
                    }

                    // Eliminar el evento
                    crop.events = crop.events.filter(e => e.id !== eventId);
                    
                    // Eliminar el evento del calendario
                    if (calendarInitialized) {
                        $('#calendar').fullCalendar('removeEvents', `event_${eventId}`);
                    }

                    this.saveCrops();
                    this.renderCrops();
                }
            }
        },

        revertEventEffects(crop, event) {
            // Solo revertir si el evento no estaba completado
            if (!event.completed) {
                switch(event.type) {
                    case 'riego':
                        crop.stats.hydration = Math.max(0, (crop.stats.hydration || 100) - 40);
                        // Actualizar última fecha de riego al evento anterior más reciente
                        this.updateLastEventDate(crop, 'riego', 'lastWatering');
                        break;
                    
                    case 'fertilizacion':
                        crop.stats.nutrition = Math.max(0, (crop.stats.nutrition || 100) - 50);
                        this.updateLastEventDate(crop, 'fertilizacion', 'lastFertilization');
                        break;
                    
                    case 'fumigacion':
                        crop.stats.pest = Math.min(100, (crop.stats.pest || 0) + 70);
                        this.updateLastEventDate(crop, 'fumigacion', 'lastFumigation');
                        break;
                    
                    case 'control_plagas':
                        crop.stats.pest = Math.min(100, (crop.stats.pest || 0) + 60);
                        crop.stats.disease = Math.min(100, (crop.stats.disease || 0) + 40);
                        break;
                    
                    case 'poda':
                        crop.stats.health = Math.max(0, (crop.stats.health || 100) - 20);
                        break;
                }

                // Recalcular salud general después de revertir los efectos
                this.updateCropHealth(crop);
            }
        },

        updateLastEventDate(crop, eventType, statKey) {
            // Buscar el último evento completado del mismo tipo
            const lastEvent = crop.completedEvents?.filter(e => e.type === eventType)
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];
            
            if (lastEvent) {
                crop.stats[statKey] = lastEvent.completedAt;
            } else {
                delete crop.stats[statKey]; // Si no hay eventos anteriores, eliminar la fecha
            }
        },

        renderCrops() {
            const cropsGrid = document.querySelector('.crops-grid');
            cropsGrid.innerHTML = '';

            this.crops.forEach(crop => {
                const stats = this.calculateCropStats(crop);
                const progress = this.calculateProgress(crop);
                const card = document.createElement('div');
                card.className = 'crop-card';

                // Determinar el estado general del cultivo
                const healthStatus = stats.health >= 80 ? 'Excelente' :
                                   stats.health >= 60 ? 'Bueno' :
                                   stats.health >= 40 ? 'Regular' :
                                   'Crítico';
                
                // Determinar íconos y colores según el estado
                const getStatusIcon = (value) => {
                    if (value >= 80) return '🟢';
                    if (value >= 60) return '🟡';
                    if (value >= 40) return '🟠';
                    return '🔴';
                };

                // Generar recomendaciones basadas en las estadísticas
                const recommendations = [];
                if (stats.hydration < 50) recommendations.push('💧 Se recomienda regar el cultivo');
                if (stats.nutrition < 50) recommendations.push('🌱 Necesita fertilización');
                if (stats.pest > 50) recommendations.push('🐛 Control de plagas necesario');
                if (stats.disease > 50) recommendations.push('🏥 Atención sanitaria requerida');
                if (stats.overWatering) recommendations.push('⚠️ Exceso de riego detectado');

                const eventsHtml = (crop.events || []).map(event => `
                    <li class="crop-event ${event.type}">
                        <span class="event-icon">${
                            event.type === 'riego' ? '💧' :
                            event.type === 'fertilizacion' ? '🌱' :
                            event.type === 'fumigacion' ? '🌫️' :
                            event.type === 'poda' ? '✂️' :
                            event.type === 'control_plagas' ? '🐛' : '📝'
                        }</span>
                        <span class="event-info">
                            <strong>${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</strong>
                            <span class="event-date">${new Date(event.date).toLocaleDateString()}</span>
                        </span>
                        <span class="event-notes">${event.notes}</span>
                        <div class="event-actions">
                            <button class="btn-complete-event" data-crop-id="${crop.id}" data-event-id="${event.id}" title="Marcar como realizado">
                                ✓
                            </button>
                            <button class="btn-delete-event" data-crop-id="${crop.id}" data-event-id="${event.id}" title="Eliminar evento">
                                ×
                            </button>
                        </div>
                    </li>
                `).join('');

                card.innerHTML = `
                    <div class="crop-header">
                        <h3 class="crop-title">
                            ${crop.name}
                            <span class="crop-status ${healthStatus.toLowerCase()}">${getStatusIcon(stats.health)}</span>
                        </h3>
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
                        <div class="crop-details">
                            <p><strong>Tipo:</strong> ${crop.type}</p>
                            <p><strong>Ciclo:</strong> ${crop.growthCycle} días</p>
                            <p><strong>Necesidad de agua:</strong> ${crop.waterNeeds}</p>
                        </div>

                        <div class="stats-container">
                            <h4>Estado del Cultivo: <span class="${healthStatus.toLowerCase()}">${healthStatus}</span></h4>
                            
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-icon">🌿</div>
                                    <div class="stat-info">
                                        <span class="stat-label">Salud General</span>
                                        <div class="stat-bar">
                                            <div class="stat-fill health" style="width: ${stats.health}%">
                                                <span class="stat-value">${stats.health}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-card">
                                    <div class="stat-icon">💧</div>
                                    <div class="stat-info">
                                        <span class="stat-label">Hidratación</span>
                                        <div class="stat-bar">
                                            <div class="stat-fill hydration" style="width: ${stats.hydration}%">
                                                <span class="stat-value">${stats.hydration}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-card">
                                    <div class="stat-icon">🌱</div>
                                    <div class="stat-info">
                                        <span class="stat-label">Nutrición</span>
                                        <div class="stat-bar">
                                            <div class="stat-fill nutrition" style="width: ${stats.nutrition}%">
                                                <span class="stat-value">${stats.nutrition}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-card">
                                    <div class="stat-icon">🌡️</div>
                                    <div class="stat-info">
                                        <span class="stat-label">Progreso</span>
                                        <div class="stat-bar">
                                            <div class="stat-fill progress" style="width: ${progress}%">
                                                <span class="stat-value">${progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            ${recommendations.length > 0 ? `
                                <div class="recommendations-panel">
                                    <h5>Recomendaciones:</h5>
                                    <ul>
                                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}

                            <div class="events-timeline">
                                <h5>Últimas actividades</h5>
                                <div class="timeline-container">
                                    <ul class="events-list">
                                        ${eventsHtml}
                                    </ul>
                                </div>
                            </div>
                        </div>
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

                // Agregar event listeners para los nuevos botones
                card.querySelectorAll('.btn-complete-event').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const cropId = parseInt(e.target.dataset.cropId);
                        const eventId = parseInt(e.target.dataset.eventId);
                        if (confirm('¿Marcar este evento como realizado?')) {
                            this.completeEvent(cropId, eventId);
                        }
                    });
                });

                card.querySelectorAll('.btn-delete-event').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const cropId = parseInt(e.target.dataset.cropId);
                        const eventId = parseInt(e.target.dataset.eventId);
                        if (confirm('¿Estás seguro de eliminar este evento?')) {
                            this.deleteEvent(cropId, eventId);
                        }
                    });
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
            date: document.getElementById('eventDate').value // La fecha seleccionada por el usuario
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