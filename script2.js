let moves = 0;
let timer;
let timerValue = 0;
let moveDelay = 1000;
let isAutomatic = false;
let userName = "";


function seleccionarNivel() {
    const nivel = document.getElementById('nivel').value;
}

function empezarJuego() {
    Swal.fire({
        title: "Ingrese su nombre",
        input: "text",
        inputPlaceholder: "Nombre del jugador",
        showCancelButton: true,
        confirmButtonText: "Iniciar juego",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed && result.value.trim() !== "") {
            userName = result.value.trim(); // Guardar el nombre del usuario
            pedirConfirmacionInicio(); // Pedir confirmación para iniciar el juego
        }
    });
}

function pedirConfirmacionInicio() {
    Swal.fire({
        title: `¿Empezar el juego, ${userName}?`,
        icon: "question",
        confirmButtonText: "Sí",
        cancelButtonText: "No",
        showCancelButton: true
    }).then((result) => {
        if (result.isConfirmed) {
            const diskCount =document.getElementById('nivel').value ;
            if (isNaN(diskCount) || diskCount < 1) return;

            initializeTowers(diskCount);
            startTimer(); // Iniciar el temporizador al comenzar el juego

            if (isAutomatic) {
                let moveSequence = [];
                generateHanoiMoves(diskCount, 'tower1', 'tower2', 'tower3', moveSequence);
                animateMoves(moveSequence);
            }
        }
    });
}

function initializeTowers(diskCount) {
    const tower1 = document.getElementById('tower1');
    tower1.innerHTML = '';
    const colors = ["#e57373", "#64b5f6", "#81c784", "#ffb74d", "#ba68c8"]; // Colores para los discos
    for (let i = diskCount; i > 0; i--) {
        const disk = document.createElement('div');
        disk.classList.add('disk');
        disk.style.width = `${i * 20}px`;
        disk.style.backgroundColor = colors[(i - 1) % colors.length];
        disk.id = `disk${i}`;
        disk.draggable = !isAutomatic;
        disk.addEventListener("dragstart", dragStart);
        tower1.appendChild(disk);
    }
    document.getElementById('moveCount').textContent = 0;
    document.getElementById('timer').textContent = 0;
    moves = 0;
    timerValue = 0;
    clearInterval(timer);
}

// Función para generar los movimientos de las Torres de Hanoi
function generateHanoiMoves(diskCount, from, to, aux, moveSequence) {
    if (diskCount === 0) return;

    generateHanoiMoves(diskCount - 1, from, aux, to, moveSequence);
    moveSequence.push({ diskCount, from, to });
    generateHanoiMoves(diskCount - 1, aux, to, from, moveSequence);
}

// Función para animar los movimientos de los discos
function animateMoves(moveSequence) {
    if (!isAutomatic || moveSequence.length === 0) {
        stopTimer();
        Swal.fire({
            title: 'Juego terminado',
            text: `¡Buen trabajo, ${userName}!`,
            icon: 'success',
            confirmButtonText: 'OK'
        });
        return;
    }

    const move = moveSequence.shift();
    setTimeout(() => {
        const disk = document.getElementById(move.from).lastChild;
        document.getElementById(move.to).appendChild(disk);
        moves++;
        document.getElementById('moveCount').textContent = moves;
        animateMoves(moveSequence);
    }, moveDelay);
}

// Función para alternar entre modo automático y manual
function toggleMode() {
    isAutomatic = !isAutomatic;
    document.getElementById("modeButton").textContent = isAutomatic ? "Modo Manual" : "Modo Automático";
    document.querySelectorAll('.disk').forEach(disk => {
        disk.draggable = !isAutomatic;
    });
}

// Funciones de arrastre y soltado
function dragStart(event) {
    const disk = event.target;
    const parentTower = disk.parentNode;

    // Solo permitir arrastrar si el disco es el último en la torre (el de arriba)
    if (disk !== parentTower.lastChild) {
        event.preventDefault(); // Cancelar el arrastre si no es el último disco
    } else {
        event.dataTransfer.setData("text", disk.id);
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const diskId = event.dataTransfer.getData("text");
    const disk = document.getElementById(diskId);
    const targetTower = event.currentTarget;

    // Validar si el disco que estamos arrastrando es menor que el último disco de la torre de destino
    if (targetTower.lastChild && parseInt(disk.style.width) > parseInt(targetTower.lastChild.style.width)) {
        Swal.fire({
            title: "Movimiento no válido",
            text: "No puedes mover un disco más grande sobre uno más pequeño",
            icon: "error",
            confirmButtonText: "OK"
        });
    } else {
        targetTower.appendChild(disk);
        moves++;
        document.getElementById('moveCount').textContent = moves;
        checkWinCondition(); // Verificar si el juego está completo
    }
}

// Agregar eventos de arrastre y soltado a cada torre
document.querySelectorAll(".tower").forEach(tower => {
    tower.addEventListener("dragover", allowDrop);
    tower.addEventListener("drop", drop);
});

// Función para iniciar el temporizador
function startTimer() {
    clearInterval(timer); // Asegurarse de no tener temporizadores duplicados
    timerValue = 0;
    timer = setInterval(() => {
        timerValue++;
        document.getElementById('timer').textContent = timerValue;
    }, 1000);
}

// Función para detener el temporizador
function stopTimer() {
    clearInterval(timer);
}


function checkWinCondition() {
    const tower3 = document.getElementById('tower3');
    const diskCount = parseInt(document.getElementById('nivel').value) ;

    // Validar que diskCount tenga un valor válido
    if (isNaN(diskCount) || diskCount <= 0) {
        console.error('El número de discos no es válido');
        return;
    }

    if (tower3.childElementCount === diskCount) {
        stopTimer(); // Detener el temporizador cuando el juego está completo
        Swal.fire({
            title: "¡Felicidades!",
            text: `Has completado el juego correctamente, ${userName}.`,
            icon: "success",
            confirmButtonText: "OK"
        }).then(() => {
            // Enviar datos al servidor para guardar en la base de datos
            const timeSpent = timerValue; // Tiempo total de la partida
            const data = new FormData();
            data.append('username', userName);
            data.append('diskCount', diskCount); // Enviamos diskCount como debe ser
            data.append('time', timeSpent);

            fetch('guardar_partida.php', {
                method: 'POST',
                body: data
            })
            .then(response => response.text())
            .then(result => {
                console.log(result); // Muestra la respuesta del servidor
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
}


// VER partidas
function verPartidas() {
    fetch('consultar_registros.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error al obtener los registros:', data.error);
                return;
            }

            // Crear la tabla
            let table = '<table><tr class="center"><th>Usuario</th><th>Número de Discos</th><th>Tiempo </th><th>Fecha</th></tr>';

            // Agregar cada partida a la tabla
            data.forEach(partida => {
                table += `<tr>
                    <td>${partida.username}</td>
                    <td>${partida.diskCount}</td>
                    <td>${partida.time}</td>
                    <td>${partida.dateRegister}</td>
                </tr>`;
            });

            table += '</table>';

            // Mostrar la tabla en SweetAlert
            Swal.fire({
                title: 'Registros de Partidas',
                html: table,
                showCloseButton: true,
                focusConfirm: false,
                confirmButtonText: 'Cerrar',
                customClass: {
                    popup: 'custom-popup' // Clase personalizada para el popup
                },
                width: '50%', // Ajustar el ancho
            });
        })
        .catch(error => {
            console.error('Error al obtener los registros:', error);
        });
}
