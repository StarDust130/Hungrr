import { Router } from 'express'
import prisma from '../config/prisma'
import { emitOrderEvent } from '../controllers/user/userController'

const router = Router()

// Get all orders for a cafe
router.get('/orders', async (req, res) => {
  try {
    const cafeId = parseInt(req.query.cafeId as string)
    if (!cafeId || isNaN(cafeId)) {
      return res.status(400).json({ error: 'Valid cafe ID is required' })
    }

    const orders = await prisma.order.findMany({
      where: {
        cafeId,
        status: { in: ['accepted', 'preparing', 'ready'] },
      },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    })
    res.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Error fetching orders' })
  }
})

// Set preparation time
router.patch('/orders/:id/prep-time', async (req, res) => {
  try {
    const { id } = req.params
    const { prepTime } = req.body
    if (!prepTime || isNaN(prepTime)) {
      return res.status(400).json({ error: 'Valid prep time is required' })
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { prepTime: parseInt(prepTime) },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    })
    emitOrderEvent(req, 'order_updated', order)
    res.json(order)
  } catch (error) {
    console.error('Error setting prep time:', error)
    res.status(500).json({ error: 'Error setting prep time' })
  }
})

// Start cooking
router.patch('/orders/:id/start-cooking', async (req, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'preparing' },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    })
    emitOrderEvent(req, 'order_updated', order)
    res.json(order)
  } catch (error) {
    console.error('Error starting cooking:', error)
    res.status(500).json({ error: 'Error starting cooking' })
  }
})

// Complete cooking
router.patch('/orders/:id/complete-cooking', async (req, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'ready' },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    })
    emitOrderEvent(req, 'order_updated', order)
    res.json(order)
  } catch (error) {
    console.error('Error completing cooking:', error)
    res.status(500).json({ error: 'Error completing cooking' })
  }
})

// Mark order as served
router.patch('/orders/:id/serve', async (req, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: 'completed',
        updated_at: new Date(),
      },
      include: {
        order_items: {
          include: {
            item: true,
            variant: true,
          },
        },
      },
    })
    emitOrderEvent(req, 'order_updated', order)
    res.json(order)
  } catch (error) {
    console.error('Error marking order as served:', error)
    res.status(500).json({ error: 'Error marking order as served' })
  }
})

export default router

