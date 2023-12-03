


class DentalMainController {

  async handle(req) {
    const context = {}

    context.socialLinks = [
      { name: "facebook", href: "#" },
      { name: "twitter", href: "#" },
      { name: "instagram", href: "#" },
      { name: "youtube", href: "#" }
    ];

    context.menu = [
      { label: "About Us", href: "#" },
      { label: "Treatments", href: "#" },
      { label: "Testimonials", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact Us", href: "#" },
    ];

    context.services = [
      {
        title: "Teeth Whitening",
        description: "Donec efficitur ullamcorper metus, eu venenatis nunc. Nam eget neque tempus, mollis sem a, faucibus mi.",
        icon: "teeth-whitening.icon",
        actionHref: "#",
        actionLabel: "Learn more..."
      },
      {
        title: "Oral Surgery",
        description: "Donec efficitur ullamcorper metus, eu venenatis nunc. Nam eget neque tempus, mollis sem a, faucibus mi.",
        icon: "oral-surgery.icon",
        actionHref: "#",
        actionLabel: "Learn more..."
      },
      {
        title: "Painless Dentistry",
        description: "Donec efficitur ullamcorper metus, eu venenatis nunc. Nam eget neque tempus, mollis sem a, faucibus mi.",
        icon: "painless-dentistry.icon",
        actionHref: "#",
        actionLabel: "Learn more..."
      },
      {
        title: "Periodontics",
        description: "Donec efficitur ullamcorper metus, eu venenatis nunc. Nam eget neque tempus, mollis sem a, faucibus mi.",
        icon: "periodontics.icon",
        actionHref: "#",
        actionLabel: "Learn more..."
      }
    ];

    context.appointment = true;

    context.testimonials = [
      {
        name: "John Doe",
        body: "Edison bulb retro cloud bread echo park, helvetica stumptown taiyaki taxidermy 90's cronut +1\n" +
          "      kinfolk. Single-origin coffee ennui shaman taiyaki vape DIY tote bag drinking vinegar cronut\n" +
          "      adaptogen squid fanny pack vaporware. Man bun next level coloring book skateboard four loko\n" +
          "      knausgaard.",
        position: "Senior Analist"
      }
    ]

    return context;
  }
}

module.exports = DentalMainController;