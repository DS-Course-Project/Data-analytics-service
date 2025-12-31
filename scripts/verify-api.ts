import { nanoid } from 'nanoid';

const BASE_URL = 'http://localhost:3000';

async function runVerification() {
    console.log('Starting verification...');

    // Headers
    const userHeaders = { 'Content-Type': 'application/json', 'x-user-id': 'test-user', 'x-user-role': 'USER' };
    const adminHeaders = { 'Content-Type': 'application/json', 'x-user-id': 'admin-user', 'x-user-role': 'ADMIN' };

    // 1. Create Ticket (User)
    console.log('\n--- Create Ticket ---');
    const userId = `user-${nanoid(5)}`;
    const createRes = await fetch(`${BASE_URL}/tickets`, {
        method: 'POST',
        headers: userHeaders,
        body: JSON.stringify({
            title: 'Test Ticket',
            description: 'This is a test ticket',
            userId: userId, // Logic might override this or check consistency, but currently controller takes from body
            priority: 'HIGH'
        })
    });

    if (!createRes.ok) throw new Error(`Create failed: ${createRes.status}`);
    const ticket = await createRes.json();
    console.log('Created Ticket:', ticket);
    const ticketId = ticket.id;

    // 2. Get Ticket (User)
    console.log('\n--- Get Ticket ---');
    const getRes = await fetch(`${BASE_URL}/tickets/${ticketId}`, { headers: userHeaders });
    if (!getRes.ok) throw new Error(`Get failed: ${getRes.status}`);
    const fetchedTicket = await getRes.json();
    console.log('Fetched Ticket:', fetchedTicket);

    // 3. Update Ticket (User)
    console.log('\n--- Update Ticket ---');
    const updateRes = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: userHeaders,
        body: JSON.stringify({
            title: 'Updated Title'
        })
    });
    if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);
    const updatedTicket = await updateRes.json();
    console.log('Updated Ticket:', updatedTicket);

    // 4. Change Status (User)
    console.log('\n--- Change Status ---');
    const statusRes = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: userHeaders,
        body: JSON.stringify({
            status: 'IN_PROGRESS'
        })
    });
    if (!statusRes.ok) throw new Error(`Status change failed: ${statusRes.status}`);
    console.log('Status Changed:', await statusRes.json());

    // 5. Assign Ticket (Admin Only)
    console.log('\n--- Assign Ticket (Admin) ---');
    const assignRes = await fetch(`${BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
            assignedTo: 'admin-1'
        })
    });
    if (!assignRes.ok) throw new Error(`Assign failed: ${assignRes.status}`);
    console.log('Assigned Ticket:', await assignRes.json());

    // 5b. Assign Ticket (User - Expect Fail)
    console.log('\n--- Assign Ticket (User - Expect Fail) ---');
    const assignFailRes = await fetch(`${BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: userHeaders,
        body: JSON.stringify({ assignedTo: 'bad-actor' })
    });
    if (assignFailRes.status === 403) {
        console.log('Successfully blocked User from assigning ticket (403)');
    } else {
        console.error(`FAILED: User was able to assign ticket or got wrong error: ${assignFailRes.status}`);
    }

    // 6. Add Comment (User)
    console.log('\n--- Add Comment ---');
    const commentRes = await fetch(`${BASE_URL}/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: userHeaders,
        body: JSON.stringify({
            content: 'Here is a comment'
        })
    });
    if (!commentRes.ok) throw new Error(`Comment failed: ${commentRes.status}`);
    console.log('Added Comment:', await commentRes.json());

    // 7. List Comments (User)
    console.log('\n--- List Comments ---');
    const listCommentsRes = await fetch(`${BASE_URL}/tickets/${ticketId}/comments`, { headers: userHeaders });
    if (!listCommentsRes.ok) throw new Error(`List comments failed: ${listCommentsRes.status}`);
    console.log('Comments:', await listCommentsRes.json());

    // 8. List Tickets (User)
    console.log('\n--- List Tickets ---');
    const listRes = await fetch(`${BASE_URL}/tickets?userId=${userId}`, { headers: userHeaders });
    if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
    const tickets = await listRes.json();
    console.log(`Found ${tickets.length} tickets for user ${userId}`);

    // 9. Delete Ticket (Admin Only)
    console.log('\n--- Delete Ticket (Admin) ---');
    const deleteRes = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: adminHeaders
    });
    if (!deleteRes.ok) throw new Error(`Delete failed: ${deleteRes.status}`);
    console.log('Ticket deleted');

    console.log('\nVerification Successful!');
}

runVerification().catch(console.error);
