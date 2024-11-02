const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// Background stars
const stars = []
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
    })
}

// Player (spaceship)
// Spaceship Design Enhancement
class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.rotation = 0
        this.radius = 20 // Adjusted radius for new spaceship size
    }

    draw() {
        c.save()

        // Spaceship positioning and rotation
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)

        // Spaceship body
        c.beginPath()
        c.moveTo(this.position.x + 30, this.position.y) // Tip of the spaceship
        c.lineTo(this.position.x - 20, this.position.y - 15) // Left wing
        c.lineTo(this.position.x - 20, this.position.y + 15) // Right wing
        c.closePath()
        c.fillStyle = '#1E90FF' // Sleek blue color for the main body
        c.shadowBlur = 15 // Glow effect
        c.shadowColor = '#1E90FF'
        c.fill()

        // Add metallic outline to the spaceship
        c.strokeStyle = '#B0C4DE' // Metallic silver color
        c.lineWidth = 2
        c.stroke()

        // Cockpit (window) of the spaceship
        c.beginPath()
        c.arc(this.position.x + 10, this.position.y, 5, 0, Math.PI * 2, false) // Circular cockpit
        c.fillStyle = '#FFD700' // Golden color for cockpit
        c.shadowBlur = 10
        c.shadowColor = '#FFD700'
        c.fill()

        // Thrusters (engine)
        c.beginPath()
        c.moveTo(this.position.x - 20, this.position.y - 10)
        c.lineTo(this.position.x - 30, this.position.y) // Left engine exhaust
        c.lineTo(this.position.x - 20, this.position.y + 10)
        c.closePath()
        c.fillStyle = '#FF4500' // Fiery orange for thrusters
        c.shadowBlur = 20
        c.shadowColor = '#FF4500'
        c.fill()

        // Engine glow
        c.beginPath()
        c.arc(this.position.x - 30, this.position.y, 5, 0, Math.PI * 2, false)
        c.fillStyle = '#FF6347' // Softer glow color for the engine
        c.shadowBlur = 15
        c.shadowColor = '#FF6347'
        c.fill()

        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Asteroids
class Asteroid {
    constructor({position, velocity, radius}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
    }

    draw() {
        // Asteroids with gradient color
        const gradient = c.createRadialGradient(
            this.position.x, this.position.y, this.radius * 0.2,
            this.position.x, this.position.y, this.radius
        )
        gradient.addColorStop(0, '#7f8c8d')
        gradient.addColorStop(1, '#2c3e50')

        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = gradient
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Projectiles
class Projectile {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 3 // Projectile size
    }

    draw() {
        // Projectiles with glow effect
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = '#FFD700'
        c.shadowBlur = 15
        c.shadowColor = "yellow"
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// Player setup
const player = new Player({
    position: {x: canvas.width / 2, y: canvas.height / 2}, 
    velocity: {x: 0, y: 0}
})

const keys  = {
    w: { pressed: false },
    a: { pressed: false },
    d: { pressed: false },
}

const SPEED = 3
const ROTATIONAL_SPEED = 0.05
const FRICTION = 0.97
const PROJECTILE_SPEED = 3
let score = 0
let gameOver = false

const projectiles = []
const asteroids = []

// Random asteroid generation
window.setInterval(() => {
    if (!gameOver) {
        const index = Math.floor(Math.random() * 4)
        let x, y
        let vx, vy
        let radius = 50 * Math.random() + 10

        switch(index) {
            case 0: // Left
                x = 0 - radius
                y = Math.random() * canvas.height
                vx = 1
                vy = 0
                break
            case 1: // Bottom
                x = Math.random() * canvas.width
                y = canvas.height + radius
                vx = 0
                vy = -1
                break
            case 2: // Right
                x = canvas.width + radius
                y = Math.random() * canvas.height
                vx = -1
                vy = 0
                break
            case 3: // Top
                x = Math.random() * canvas.width
                y = 0 - radius
                vx = 0
                vy = 1
                break
        }

        asteroids.push(
            new Asteroid({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy},
                radius: radius
            }))
    }
}, 3000)

function circleCollision(circle1, circle2) {
    const xDifference = circle2.position.x - circle1.position.x
    const yDifference = circle2.position.y - circle1.position.y

    const distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference)

    return distance <= circle1.radius + circle2.radius
}

// Explosive effect
function explode(x, y) {
    for (let i = 0; i < 20; i++) {
        c.beginPath()
        c.arc(x, y, 5, 0, Math.PI * 2, false)
        c.fillStyle = 'orange'
        c.fill()
        c.closePath()
    }
}

// Animation loop
function animate() {
    if (!gameOver) {
        window.requestAnimationFrame(animate)
        c.fillStyle = 'black'
        c.fillRect(0, 0, canvas.width, canvas.height)

        // Background stars
        stars.forEach(star => {
            c.beginPath()
            c.arc(star.x, star.y, star.radius, 0, Math.PI * 2, false)
            c.fillStyle = 'white'
            c.fill()
            c.closePath()
        })

        player.update()

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i]
            projectile.update()

            if (projectile.position.x + projectile.radius < 0 || 
                projectile.position.x - projectile.radius > canvas.width ||
                projectile.position.y - projectile.radius > canvas.height ||
                projectile.position.y + projectile.radius < 0) {
                projectiles.splice(i, 1)
            }
        }    

        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i]
            asteroid.update()

            if (circleCollision(player, asteroid)) {
                gameOver = true
                alert('Game Over! Your score: ' + score)
                break
            }

            if (asteroid.position.x + asteroid.radius < 0 || 
                asteroid.position.x - asteroid.radius > canvas.width ||
                asteroid.position.y - asteroid.radius > canvas.height ||
                asteroid.position.y + asteroid.radius < 0) {
                asteroids.splice(i, 1)
            }

            for (let j = projectiles.length - 1; j >= 0; j--) {
                const projectile = projectiles[j]

                if (circleCollision(asteroid, projectile)) {
                    asteroids.splice(i, 1)
                    projectiles.splice(j, 1)
                    score += 1

                    // Explosion effect
                    explode(asteroid.position.x, asteroid.position.y)
                    break
                }
            }
        }

        if (keys.w.pressed) {
            player.velocity.x = Math.cos(player.rotation) * SPEED
            player.velocity.y = Math.sin(player.rotation) * SPEED
        } else {
            player.velocity.x *= FRICTION
            player.velocity.y *= FRICTION
        }

        if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED
        else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED

        // Score display
        c.fillStyle = '#FFD700'
        c.font = '24px Orbitron'
        c.fillText('Score: ' + score, 20, 40)
    }
}

animate()

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = true
            break
        case 'KeyA':
            keys.a.pressed = true
            break 
        case 'KeyD':
            keys.d.pressed = true
            break 
        case 'Space':
            projectiles.push(
                new Projectile({
                  position: {
                      x: player.position.x + Math.cos(player.rotation) * 30,
                      y: player.position.y + Math.sin(player.rotation) * 30,
                  },
                  velocity: {
                      x: Math.cos(player.rotation) * PROJECTILE_SPEED,
                      y: Math.sin(player.rotation) * PROJECTILE_SPEED
                  }
              })
            )
            break 
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keys.w.pressed = false
            break
        case 'KeyA':
            keys.a.pressed = false
            break 
        case 'KeyD':
            keys.d.pressed = false
            break 
    }
})

