package com.musclehub.backend.config;

import com.musclehub.backend.entity.User;
import com.musclehub.backend.entity.Equipment;
import com.musclehub.backend.entity.Supplement;
import com.musclehub.backend.entity.Inquiry;
import com.musclehub.backend.repository.EquipmentRepository;
import com.musclehub.backend.repository.SupplementRepository;
import com.musclehub.backend.repository.UserRepository;
import com.musclehub.backend.repository.InquiryRepository;
import com.musclehub.backend.repository.TrainerSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EquipmentRepository equipmentRepository;
    private final SupplementRepository supplementRepository;
    private final InquiryRepository inquiryRepository;
    private final TrainerSlotRepository trainerSlotRepository;
    private final com.musclehub.backend.repository.MembershipPackageRepository packageRepository;

    @Override
    public void run(String... args) throws Exception {
        // Seed some membership packages if empty
        if (packageRepository.count() == 0) {
            System.out.println("Seeding default membership packages...");

            com.musclehub.backend.entity.MembershipPackage p1 = new com.musclehub.backend.entity.MembershipPackage();
            p1.setName("Starter Core");
            p1.setDescription("Basic access to gym equipment and lockers. Ideal for self-training.");
            p1.setPrice(35.0);
            p1.setDurationMonths(1);
            packageRepository.save(p1);

            com.musclehub.backend.entity.MembershipPackage p2 = new com.musclehub.backend.entity.MembershipPackage();
            p2.setName("Elite Athlete");
            p2.setDescription("Unlimited access, AI Smart Plans, and priority trainer booking.");
            p2.setPrice(85.0);
            p2.setDurationMonths(3);
            packageRepository.save(p2);

            com.musclehub.backend.entity.MembershipPackage p3 = new com.musclehub.backend.entity.MembershipPackage();
            p3.setName("Ultimate Transformation");
            p3.setDescription("VIP treatment with 1-on-1 sessions, personalized nutrition, and AI progress reports.");
            p3.setPrice(250.0);
            p3.setDurationMonths(12);
            packageRepository.save(p3);
        }

        // Check if admin exists
        User admin = userRepository.findByUsername("admin").orElse(null);

        if (admin == null) {
            admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@musclehub.com");
            admin.setRole(User.Role.ADMIN);
            System.out.println("Creating new Admin user...");
        } else {
            System.out.println("Updating existing Admin user password...");
        }

        // Always reset password to ensure it is hashed correctly
        admin.setPassword(passwordEncoder.encode("1234"));
        userRepository.save(admin);

        System.out.println("Admin user seeded/updated successfully! Password is '1234'");

        // Seed a default member for testing
        if (!userRepository.existsByUsername("member")) {
            User member = new User();
            member.setUsername("member");
            member.setEmail("member@musclehub.com");
            member.setPassword(passwordEncoder.encode("123"));
            member.setRole(User.Role.MEMBER);
            member.setAge(25);
            member.setHeight(175.0);
            member.setWeight(70.0);
            member.setLoyaltyPoints(1450);
            member.setHealthDetails("Standard fitness goals. No known allergies.");
            userRepository.save(member);
            System.out.println("Member user 'member' created with password '123'");
        }

        // Seed default trainers
        String[][] trainersData = {
                { "trainer", "trainer@musclehub.com", "123" },
                { "alex_fit", "alex@musclehub.com", "123" },
                { "sarah_pro", "sarah@musclehub.com", "123" }
        };

        for (String[] tData : trainersData) {
            if (!userRepository.existsByUsername(tData[0])) {
                User trainer = new User();
                trainer.setUsername(tData[0]);
                trainer.setEmail(tData[1]);
                trainer.setPassword(passwordEncoder.encode(tData[2]));
                trainer.setRole(User.Role.TRAINER);
                userRepository.save(trainer);
                System.out.println("Trainer user '" + tData[0] + "' created with password '123'");
            }
        }

        // Ensure 'member' is assigned to 'trainer' for testing
        User testTrainer = userRepository.findByUsername("trainer").orElse(null);
        User testMember = userRepository.findByUsername("member").orElse(null);
        if (testTrainer != null && testMember != null) {
            testMember.setTrainer(testTrainer);
            userRepository.save(testMember);
            System.out.println("Default member linked to trainer for testing.");
        }

        // Seed some equipment if empty
        if (equipmentRepository.count() == 0) {
            Equipment e1 = new Equipment();
            e1.setName("Treadmill T800");
            e1.setStatus(Equipment.Status.WORKING);
            e1.setLastMaintenanceDate(LocalDate.now().minusMonths(1));
            equipmentRepository.save(e1);
        }

        // Seed some supplements if empty
        if (supplementRepository.count() == 0) {
            Supplement s1 = new Supplement();
            s1.setName("Whey Protein");
            s1.setBrand("Optimum Nutrition");
            s1.setPrice(85.0);
            s1.setStock(50);
            s1.setCategory("Protein");
            supplementRepository.save(s1);
        }

        // Seed some inquiries if empty
        if (inquiryRepository.count() == 0) {
            User member = userRepository.findByUsername("member").orElse(null);
            if (member != null) {
                Inquiry inq = new Inquiry();
                inq.setUser(member);
                inq.setSubject("Knee Pain");
                inq.setMessage("I've been feeling some pain in my left knee after squats. Should I change my form?");
                inq.setStatus(Inquiry.Status.OPEN);
                inquiryRepository.save(inq);
            }
        }

        // Seed some trainer slots if empty
        if (trainerSlotRepository.count() == 0) {
            User trainer = userRepository.findByUsername("trainer").orElse(null);
            if (trainer != null) {
                com.musclehub.backend.entity.TrainerSlot s1 = new com.musclehub.backend.entity.TrainerSlot();
                s1.setTrainer(trainer);
                s1.setStartTime(java.time.LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
                s1.setEndTime(java.time.LocalDateTime.now().plusDays(1).withHour(11).withMinute(0));
                s1.setCapacity(5);
                s1.setBookedCount(0);
                s1.setStatus("AVAILABLE");
                trainerSlotRepository.save(s1);

                com.musclehub.backend.entity.TrainerSlot s2 = new com.musclehub.backend.entity.TrainerSlot();
                s2.setTrainer(trainer);
                s2.setStartTime(java.time.LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));
                s2.setEndTime(java.time.LocalDateTime.now().plusDays(2).withHour(15).withMinute(0));
                s2.setCapacity(3);
                s2.setBookedCount(0);
                s2.setStatus("AVAILABLE");
                trainerSlotRepository.save(s2);
            }
        }
    }
}
