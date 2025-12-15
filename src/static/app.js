document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select so options don't duplicate if fetched again
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Top row: title + availability badge
        const topRow = document.createElement("div");
        topRow.className = "top-row";

        const title = document.createElement("h4");
        title.textContent = name;

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = `${spotsLeft} spots left`;

        topRow.appendChild(title);
        topRow.appendChild(badge);

        const desc = document.createElement("p");
        desc.textContent = details.description;

        const schedule = document.createElement("p");
        schedule.className = "meta";
        schedule.textContent = `Schedule: ${details.schedule}`;

        // Participants chips
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants";
        const participantsTitle = document.createElement("p");
        participantsTitle.className = "participants-title";
        participantsTitle.textContent = "Participants:";

        const participantsBadges = document.createElement("div");
        participantsBadges.className = "participants-badges";
        if (Array.isArray(details.participants) && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const chip = document.createElement("span");
            chip.className = "participant-chip";
            chip.textContent = p;
            participantsBadges.appendChild(chip);
          });
        } else {
          const no = document.createElement("span");
          no.className = "no-participants";
          no.textContent = "No participants yet";
          participantsBadges.appendChild(no);
        }

        participantsSection.appendChild(participantsTitle);
        participantsSection.appendChild(participantsBadges);

        activityCard.appendChild(topRow);
        activityCard.appendChild(desc);
        activityCard.appendChild(schedule);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
