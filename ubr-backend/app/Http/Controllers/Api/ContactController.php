<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'urgency' => 'sometimes|in:low,medium,high',
            'copy' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $contactData = $validator->validated();
        $contactData['urgency'] = $contactData['urgency'] ?? 'low';

        // Envoyer l'email à l'équipe support
        try {
            Mail::send('emails.contact', $contactData, function ($message) use ($contactData) {
                $message->to('support@ubr.ci')
                    ->subject('[UBR Contact] ' . $contactData['subject'])
                    ->replyTo($contactData['email'], $contactData['name']);
                
                if ($contactData['urgency'] === 'high') {
                    $message->priority(1); // Haute priorité
                }
            });

            // Envoyer une copie à l'expéditeur si demandé
            if ($request->boolean('copy')) {
                Mail::send('emails.contact-copy', $contactData, function ($message) use ($contactData) {
                    $message->to($contactData['email'], $contactData['name'])
                        ->subject('[UBR] Copie de votre message - ' . $contactData['subject']);
                });
            }

            return response()->json([
                'message' => 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.'
            ], 500);
        }
    }
}