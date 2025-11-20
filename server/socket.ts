import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { prisma } from '../src/lib/prisma'

export function initializeSocket(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        console.log(`User ${socket.id} joined room ${roomId}`)
        })

        socket.on('send-message', async (data: {
        content: string
        userId: string
        userName: string
        roomId: string
        }) => {
        try {
            const message = await prisma.message.create({
            data: {
                content: data.content,
                userId: data.userId,
                roomId: data.roomId
            },
            include: {
                user: {
                select: {
                    name: true,
                    email: true
                }
                }
            }
            })

            io.to(data.roomId).emit('receive-message', {
            id: message.id,
            content: message.content,
            userName: message.user.name || message.user.email,
            createdAt: message.createdAt
            })
        } catch (error) {
            console.error('Error saving message:', error)
        }
        })

        socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
        })
    })

    return io
}