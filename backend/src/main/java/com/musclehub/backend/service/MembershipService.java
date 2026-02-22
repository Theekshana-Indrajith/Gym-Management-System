package com.musclehub.backend.service;

import com.musclehub.backend.entity.MembershipPackage;
import com.musclehub.backend.entity.MembershipRequest;
import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.MembershipPackageRepository;
import com.musclehub.backend.repository.MembershipRequestRepository;
import com.musclehub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipPackageRepository packageRepository;
    private final MembershipRequestRepository requestRepository;
    private final UserRepository userRepository;

    // Package Management (Admin)
    public List<MembershipPackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public List<MembershipPackage> getActivePackages() {
        return packageRepository.findAllByIsActiveTrue();
    }

    public MembershipPackage createPackage(MembershipPackage pkg) {
        return packageRepository.save(pkg);
    }

    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }

    // Requests Management (Admin)
    public List<MembershipRequest> getPendingRequests() {
        return requestRepository.findAllByStatus(MembershipRequest.Status.PENDING);
    }

    @Transactional
    public MembershipRequest processRequest(Long requestId, boolean approve) {
        MembershipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (approve) {
            request.setStatus(MembershipRequest.Status.APPROVED);
            User user = request.getUser();
            user.setMembershipStatus(User.MembershipStatus.ACTIVE);
            user.setActivePackage(request.getMembershipPackage());
            userRepository.save(user);
        } else {
            request.setStatus(MembershipRequest.Status.REJECTED);
            User user = request.getUser();
            user.setMembershipStatus(User.MembershipStatus.NONE);
            userRepository.save(user);
        }

        request.setProcessedDate(LocalDateTime.now());
        return requestRepository.save(request);
    }

    private static final String UPLOAD_DIR = "uploads/slips";

    // Member Side
    @Transactional
    public MembershipRequest createRequest(String username, Long packageId, String paymentRef, MultipartFile slip) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MembershipPackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        MembershipRequest request = new MembershipRequest();
        request.setUser(user);
        request.setMembershipPackage(pkg);
        request.setPaymentReference(paymentRef);
        request.setStatus(MembershipRequest.Status.PENDING);

        // Handle file upload
        if (slip != null && !slip.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String fileName = UUID.randomUUID().toString() + "_" + slip.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(slip.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                request.setPaymentSlipUrl("/api/membership/slips/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Could not save payment slip", e);
            }
        }

        user.setMembershipStatus(User.MembershipStatus.PENDING);
        userRepository.save(user);

        return requestRepository.save(request);
    }

    public List<User> getAllMembers() {
        return userRepository.findAllByRole(User.Role.MEMBER);
    }

    @Transactional
    public void deactivateMembership(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setMembershipStatus(User.MembershipStatus.NONE);
        user.setActivePackage(null);
        userRepository.save(user);
    }
}
