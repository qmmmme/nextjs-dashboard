//By adding the 'use server', you mark all the exported functions within the file as server functions
'use server';
//In your actions.ts file, import Zod and define a schema that matches the shape of your form object. 
//This schema will validate the formData before saving it to a database.
import {date, z} from 'zod';
// insert data to DB
import { sql } from '@vercel/postgres';

//Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server. 
//You can do this with the revalidatePath function from Next.js:
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(), //change from a string to number with coerce
    status: z.enum(['pending', 'paid']), // use enum as union type
    date: z.string(),
});
const CreateInvoice = FormSchema.omit({id: true, date: true});


export async function createInvoice(formData: FormData){
    // const rawFormData = {
    //     customerId: formData.get('customerId'),
    //     amount: formData.get('amount'),
    //     status: formData.get('status'),
    // };
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    //Tip: If you're working with forms that have many fields, you may want to consider using the entries() method with JavaScript's Object.fromEntries(). 
    //For example:
    //const rawData = Object.fromEntries(formData.entries())
    //test it out
    //console.log(rawFormData);
    //console.log(rawData);
    //type validation and coercion
    //console.log(typeof rawFormData.amount);// input return a string
    //we'll use Zod, a TypeScript-first validation library that can simplify this task for you.

    //t's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;
    //Finally, let's create a new date with the format "YYYY-MM-DD" for the invoice's creation date:
    const date = new Date().toISOString().split('T')[0];

    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    //Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};
const UpdateInvoice = FormSchema.omit({id: true, date: true});
export async function updateInvoice(id: string, formData: FormData){
    const {customerId, amount, status} = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    await sql`
        UPDATE invoices 
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');// to fresh the new table data
    redirect('/dashboard/invoices');
}
export async function deleteInvoice(id: string){
    await sql`
        DELETE FROM invoices WHERE id = ${id};
    `;
    revalidatePath('/dashboard/invoices');
}