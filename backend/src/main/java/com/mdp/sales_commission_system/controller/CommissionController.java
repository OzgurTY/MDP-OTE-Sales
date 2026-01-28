package com.mdp.sales_commission_system.controller;

import com.mdp.sales_commission_system.model.CalculationRequest;
import com.mdp.sales_commission_system.service.CommissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/commission")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend
public class CommissionController {

    private final CommissionService commissionService;

    @PostMapping("/calculate")
    public ResponseEntity<Double> calculateCommission(@RequestBody CalculationRequest request) {
        double commission = commissionService.calculateCommission(
                request.getUser(),
                request.getTarget(),
                request.getDeals(),
                request.getRules());
        return ResponseEntity.ok(commission);
    }
}
