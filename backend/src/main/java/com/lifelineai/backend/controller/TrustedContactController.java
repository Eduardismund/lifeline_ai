package com.lifelineai.backend.controller;

import com.lifelineai.backend.entity.TrustedContact;
import com.lifelineai.backend.service.TrustedContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trusted-contacts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TrustedContactController {
    
    private final TrustedContactService trustedContactService;
    
    @GetMapping("/bond/{bondId}")
    public ResponseEntity<List<TrustedContact>> getTrustedContacts(@PathVariable Long bondId) {
        List<TrustedContact> contacts = trustedContactService.getTrustedContactsByBondId(bondId);
        return ResponseEntity.ok(contacts);
    }
    
    @PostMapping("/bond/{bondId}")
    public ResponseEntity<TrustedContact> addTrustedContact(
            @PathVariable Long bondId,
            @Valid @RequestBody TrustedContact contact) {
        TrustedContact created = trustedContactService.addTrustedContact(bondId, contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> deleteTrustedContact(@PathVariable Long contactId) {
        trustedContactService.deleteTrustedContact(contactId);
        return ResponseEntity.noContent().build();
    }
}