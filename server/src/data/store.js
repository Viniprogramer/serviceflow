export const db = {
  clients: [
    { id: 1, name: 'Acme Industries', contact: 'Marina Souza', phone: '+55 11 98888-1111' }
  ],
  technicians: [
    { id: 1, name: 'Carlos Menezes', specialty: 'HVAC' }
  ],
  services: [
    { id: 1, title: 'Preventive Maintenance', basePrice: 450 }
  ],
  equipments: [
    { id: 1, clientId: 1, name: 'Industrial Chiller', serialNumber: 'CH-9901' }
  ],
  workOrders: [
    {
      id: 1,
      clientId: 1,
      technicianId: 1,
      serviceId: 1,
      equipmentId: 1,
      status: 'OPEN',
      description: 'Initial diagnosis and checklist.',
      photos: [],
      createdAt: new Date().toISOString()
    }
  ]
};

export function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}
