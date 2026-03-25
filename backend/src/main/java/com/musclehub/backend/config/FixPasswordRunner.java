package com.musclehub.backend.config;

import com.musclehub.backend.entity.User;
import com.musclehub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FixPasswordRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String targetUser = "theekshana";
        User user = userRepository.findByUsername(targetUser).orElse(null);

        if (user != null) {
            System.out.println(">>> FIXER: Found user '" + targetUser + "'. Ensuring password is '123'.");
            user.setPassword(passwordEncoder.encode("123"));
            userRepository.save(user);
        } else {
            System.out.println(">>> FIXER: User '" + targetUser + "' not found. Checking for 'member' to rename...");
            User member = userRepository.findByUsername("member").orElse(null);

            if (member != null) {
                System.out.println(">>> FIXER: Found 'member'. Renaming to '" + targetUser + "'.");
                member.setUsername(targetUser);
                // Change email to avoid conflict with future DataSeeder runs
                if ("member@musclehub.com".equals(member.getEmail())) {
                    member.setEmail("theekshana@musclehub.com");
                }
                member.setPassword(passwordEncoder.encode("123"));
                userRepository.save(member);
                System.out.println(">>> FIXER: Account renamed successfully!");
            } else {
                System.out.println(">>> FIXER: 'member' also not found. Creating new user '" + targetUser + "'.");
                User newUser = new User();
                newUser.setUsername(targetUser);
                newUser.setEmail("theekshana@musclehub.com");
                newUser.setPassword(passwordEncoder.encode("123"));
                newUser.setRole(User.Role.MEMBER);
                newUser.setAge(25);
                newUser.setHeight(175.0);
                newUser.setWeight(70.0);
                newUser.setLoyaltyPoints(100);
                userRepository.save(newUser);
                System.out.println(">>> FIXER: Created new user '" + targetUser + "'.");
            }
        }
    }
}
