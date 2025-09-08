<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reported_user_id' => 'sometimes|exists:users,id',
            'type' => 'required|in:fake_profile,inappropriate_content,harassment,scam,underage,impersonation,technical_issue,other',
            'urgency' => 'required|in:low,medium,high',
            'description' => 'required|string|max:2000',
            'evidence' => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $report = Report::create([
            'reporter_id' => $user->id,
            'reported_user_id' => $request->reported_user_id,
            'type' => $request->type,
            'urgency' => $request->urgency,
            'description' => $request->description,
            'evidence' => $request->evidence,
        ]);

        // Envoyer une notification aux admins pour les cas urgents
        if ($request->urgency === 'high') {
            $admins = User::where('is_admin', true)->get();
            foreach ($admins as $admin) {
                \App\Models\Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'admin',
                    'title' => 'Signalement urgent',
                    'content' => 'Un nouveau signalement urgent nécessite votre attention',
                    'data' => ['report_id' => $report->id]
                ]);
            }
        }

        return response()->json([
            'message' => 'Signalement envoyé avec succès',
            'tracking_number' => $report->tracking_number,
            'report' => $report
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $reports = $user->reports()
            ->with('reportedUser.primaryPhoto')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reports);
    }

    public function show(Request $request, $trackingNumber)
    {
        $user = $request->user();

        $report = Report::where('tracking_number', $trackingNumber)
            ->where('reporter_id', $user->id)
            ->with(['reportedUser.primaryPhoto', 'handler'])
            ->firstOrFail();

        return response()->json($report);
    }
}